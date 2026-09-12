// Server-side checkout — prices, validates, and taxes against OUR Postgres data,
// charges the card via Square Payments (payments only, no Square catalog/order),
// then persists the order and decrements inventory. Server-only.
//
// Money is never trusted from the client: totals are recomputed here from DB
// prices + the shop's tax/fee settings.

import { eq, inArray, sql } from "drizzle-orm";
import { square, locationId } from "@/lib/square";
import { db } from "@/lib/db";
import {
  products,
  variations,
  orders,
  orderItems,
  payments,
  type DeliveryAddress,
} from "@/lib/db/schema";
import { getSettings, deliveryFeeCents, type Settings } from "@/lib/settings";
import { discountBpsForEmail } from "@/lib/discounts";
import { couponForCode, normalizeCode, type CouponMatch } from "@/lib/coupons";
import {
  getCustomDrink,
  getRecipeContexts,
  CUSTOM_PRODUCT_ID,
  type RecipeContext,
} from "@/lib/custom-drink";
import type { CustomConfig, CustomDrinkData } from "@/lib/custom-drink-types";
import { notifyNewOrder } from "@/lib/notifications";
import { isMethodAvailable, type FulfillmentMethod } from "@/lib/fulfillment";

export type { DeliveryAddress };
export type CheckoutLine = { variationId: string; qty: number; custom?: CustomConfig };
export type Customer = { name: string; email?: string; phone?: string; note?: string };
export type Fulfillment = { method: FulfillmentMethod; address?: DeliveryAddress };

export type OrderTotals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
};

/** The discount inputs for an order: the vendor rate (from the email) and any
 * matched coupon, plus whether an entered code was recognized (null when none
 * was tried — lets the UI show an "invalid code" hint). The cents are worked out
 * later from the subtotal, since a coupon may be percent- or dollar-based. */
type DiscountResolution = {
  vendorBps: number;
  coupon: CouponMatch | null;
  couponValid: boolean | null;
};

/** Look up the vendor rate (from the email) and any coupon (from the code). */
async function resolveDiscount(
  email?: string | null,
  couponCode?: string | null,
): Promise<DiscountResolution> {
  const [vendorBps, coupon] = await Promise.all([
    discountBpsForEmail(email),
    couponForCode(couponCode),
  ]);
  return {
    vendorBps,
    coupon,
    couponValid: normalizeCode(couponCode) ? coupon != null : null,
  };
}

/** The discount off a given subtotal in cents, and the coupon code that produced
 * it (null when a vendor rate or nothing did). A coupon and a vendor rate don't
 * stack — the customer gets the better of the two; a tie goes to the coupon
 * since the customer explicitly entered it. */
function applyDiscount(
  subtotal: number,
  d: DiscountResolution,
): { discountCents: number; appliedCouponCode: string | null } {
  const vendorCents = Math.round((subtotal * d.vendorBps) / 10000);
  const couponCents = d.coupon
    ? d.coupon.kind === "fixed"
      ? Math.min(subtotal, d.coupon.amountCents)
      : Math.round((subtotal * d.coupon.bps) / 10000)
    : 0;
  const useCoupon = couponCents > 0 && couponCents >= vendorCents;
  return {
    discountCents: Math.min(subtotal, Math.max(vendorCents, couponCents)),
    appliedCouponCode: useCoupon ? d.coupon!.code : null,
  };
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; problems: string[]; soldOut: string[]; paused?: boolean };

const PAUSED_FALLBACK = "Online ordering is temporarily unavailable, check back soon!";

/** Thrown when inventory/availability/pause changes between cart and charge. */
export class SoldOutError extends Error {
  problems: string[];
  soldOut: string[];
  paused: boolean;
  constructor(problems: string[], soldOut: string[], paused = false) {
    super(problems.join(" "));
    this.name = "SoldOutError";
    this.problems = problems;
    this.soldOut = soldOut;
    this.paused = paused;
  }
}

type LineRow = {
  vId: string;
  vName: string;
  price: number;
  vAvail: boolean;
  vSold: boolean;
  pId: string;
  pName: string;
  pAvail: boolean;
  pHidden: boolean;
  taxRateBps: number | null;
  track: boolean;
  stock: number;
};

async function queryLineRows(lines: CheckoutLine[]): Promise<Map<string, LineRow>> {
  const ids = lines.map((l) => l.variationId);
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      vId: variations.id,
      vName: variations.name,
      price: variations.priceCents,
      vAvail: variations.available,
      vSold: variations.soldOut,
      pId: products.id,
      pName: products.name,
      pAvail: products.available,
      pHidden: products.hidden,
      taxRateBps: products.taxRateBps,
      track: products.trackInventory,
      stock: products.stock,
    })
    .from(variations)
    .innerJoin(products, eq(variations.productId, products.id))
    .where(inArray(variations.id, ids));
  return new Map(rows.map((r) => [r.vId, r]));
}

/** Recipe contexts for any "Customize this drink" lines (keyed by product id).
 * Empty when no line carries a recipeProductId. */
function loadRecipeContexts(lines: CheckoutLine[]): Promise<Map<string, RecipeContext>> {
  const ids = lines
    .map((l) => l.custom?.recipeProductId)
    .filter((x): x is string => !!x);
  return ids.length ? getRecipeContexts(ids) : Promise.resolve(new Map());
}

/** Re-check the cart against live DB data, the kill switch, and inventory. */
export async function validateLines(lines: CheckoutLine[]): Promise<ValidationResult> {
  const s = await getSettings();
  if (!s.acceptingOrders) {
    return {
      ok: false,
      problems: [s.pausedMessage || PAUSED_FALLBACK],
      soldOut: [],
      paused: true,
    };
  }
  if (lines.length === 0) {
    return { ok: false, problems: ["Your cart is empty."], soldOut: [] };
  }

  const rows = await queryLineRows(lines);
  const problems: string[] = [];
  const soldOut = new Set<string>();
  const wantByProduct = new Map<string, number>();

  for (const line of lines) {
    const r = rows.get(line.variationId);
    if (!r) {
      problems.push("An item in your cart is no longer available.");
      soldOut.add(line.variationId);
      continue;
    }
    if (!Number.isInteger(line.qty) || line.qty <= 0) {
      problems.push("An item has an invalid quantity.");
      continue;
    }
    if (!r.vAvail || r.vSold || !r.pAvail || r.pHidden) {
      problems.push(`${r.pName} (${r.vName}) is sold out.`);
      soldOut.add(line.variationId);
      continue;
    }
    wantByProduct.set(r.pId, (wantByProduct.get(r.pId) ?? 0) + line.qty);
  }

  // Inventory: a tracked product can't fulfil more than its stock.
  for (const line of lines) {
    const r = rows.get(line.variationId);
    if (!r || !r.track || soldOut.has(line.variationId)) continue;
    if ((wantByProduct.get(r.pId) ?? 0) > r.stock) {
      problems.push(`${r.pName} is sold out.`);
      soldOut.add(line.variationId);
    }
  }

  // Custom drinks: the build must be valid against the live options + settings,
  // and only the custom product may carry a build.
  const touchesCustom = lines.some(
    (l) => l.custom || rows.get(l.variationId)?.pId === CUSTOM_PRODUCT_ID,
  );
  if (touchesCustom) {
    const [customData, recipes] = await Promise.all([
      getCustomDrink(),
      loadRecipeContexts(lines),
    ]);
    for (const line of lines) {
      const r = rows.get(line.variationId);
      if (!r || soldOut.has(line.variationId)) continue;
      const isCustomProduct = r.pId === CUSTOM_PRODUCT_ID;
      if (isCustomProduct && !line.custom) {
        problems.push("A custom drink is missing its build.");
        soldOut.add(line.variationId);
      } else if (line.custom && !isCustomProduct) {
        problems.push("That item can't be customized.");
        soldOut.add(line.variationId);
      } else if (line.custom) {
        const rc = line.custom.recipeProductId;
        if (!customData) {
          problems.push("Custom drinks aren't available right now.");
          soldOut.add(line.variationId);
        } else if (rc && !recipes.get(rc)) {
          problems.push("That item can't be customized right now.");
          soldOut.add(line.variationId);
        } else {
          const addon = resolveCustomAddon(line.custom, customData, rc ? recipes.get(rc) : undefined);
          if (!addon.ok) {
            problems.push(addon.reason);
            soldOut.add(line.variationId);
          }
        }
      }
    }
  }

  const uniqueProblems = [...new Set(problems)];
  return uniqueProblems.length
    ? { ok: false, problems: uniqueProblems, soldOut: [...soldOut] }
    : { ok: true };
}

/** Check the chosen fulfillment method is offered and has the data it needs. */
export function validateFulfillment(f: Fulfillment): { ok: true } | { ok: false; problems: string[] } {
  if (!isMethodAvailable(f.method)) {
    return { ok: false, problems: ["That fulfillment method isn't available."] };
  }
  if (f.method === "delivery") {
    const a = f.address;
    const missing =
      !a?.line1?.trim() || !a?.city?.trim() || !a?.state?.trim() || !a?.zip?.trim();
    if (missing) {
      return { ok: false, problems: ["Please enter your full delivery address."] };
    }
  }
  return { ok: true };
}

type SnapshotItem = {
  variationId: string;
  productId: string;
  productName: string;
  variationName: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
  taxable: boolean;
  taxRateBps: number;
  taxCents: number;
  track: boolean;
  customSummary?: string;
};

type CustomAddon =
  | { ok: true; addonCents: number; summary: string }
  | { ok: false; reason: string };

/** Validate a custom-drink config against the live options and price its add-ons
 * (everything on top of the size's base price). Server-authoritative.
 *
 * `recipe` is set when the build started from a predefined item's "Customize"
 * button: the free-flavor threshold becomes that item's included-flavor count and
 * the base must belong to the item's category — both re-derived from the DB here,
 * never trusted from the client. */
function resolveCustomAddon(
  config: CustomConfig,
  data: CustomDrinkData,
  recipe?: RecipeContext,
): CustomAddon {
  const p = data.pricing;
  const base = data.bases.find((b) => b.id === config.baseId);
  if (!base) return { ok: false, reason: "That base isn't available." };
  if (config.sugarFree ? !base.availableSugarFree : !base.availableRegular)
    return { ok: false, reason: "That base isn't available in that style." };
  if (recipe && !recipe.baseIds.includes(config.baseId))
    return { ok: false, reason: "That base isn't available for this drink." };

  if (config.syrupIds.length < 1) return { ok: false, reason: "Pick at least one flavor." };
  if (config.syrupIds.length > p.maxSyrups)
    return { ok: false, reason: `Too many flavors (max ${p.maxSyrups}).` };
  const syrupNames: string[] = [];
  for (const id of config.syrupIds) {
    const syr = data.syrups.find((x) => x.id === id);
    if (!syr) return { ok: false, reason: "A flavor isn't available." };
    if (config.sugarFree ? !syr.availableSugarFree : !syr.availableRegular)
      return { ok: false, reason: "A flavor isn't available in that style." };
    syrupNames.push(syr.name);
  }

  // Creams & toppings — free, no style restriction.
  const toppingNames: string[] = [];
  for (const id of config.toppingIds ?? []) {
    const top = data.toppings.find((x) => x.id === id);
    if (!top) return { ok: false, reason: "A topping isn't available." };
    toppingNames.push(top.name);
  }

  let milkName: string | undefined;
  if (config.milkId) {
    const milk = data.milks.find((x) => x.id === config.milkId);
    if (!milk) return { ok: false, reason: "That milk isn't available." };
    milkName = milk.name;
  }

  // Included flavors are free (the item's recipe count when customizing a
  // predefined drink, else the shop's global free allowance); extras cost each.
  const freeSyrups = recipe ? recipe.freeSyrups : p.freeSyrups;
  const paidSyrups = Math.max(0, config.syrupIds.length - freeSyrups);
  const addonCents =
    paidSyrups * p.syrupCents +
    (config.caffeine ? p.caffeineCents : 0) +
    (config.electrolytes ? p.electrolyteCents : 0) +
    (config.milkId ? p.milkCents : 0);

  const summary = [
    config.sugarFree ? "Sugar-free" : "Regular",
    base.name,
    syrupNames.join(", "),
    toppingNames.length ? `+ ${toppingNames.join(", ")}` : "",
    config.caffeine ? "+ Caffeine" : "",
    config.electrolytes ? "+ Electrolytes" : "",
    milkName ? `+ ${milkName}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return { ok: true, addonCents, summary };
}

const NO_DISCOUNT: DiscountResolution = { vendorBps: 0, coupon: null, couponValid: null };

function computeTotals(
  rows: Map<string, LineRow>,
  lines: CheckoutLine[],
  method: FulfillmentMethod,
  s: Settings,
  discount: DiscountResolution = NO_DISCOUNT,
  customData: CustomDrinkData | null = null,
  recipes: Map<string, RecipeContext> = new Map(),
): { totals: OrderTotals; items: SnapshotItem[]; appliedCouponCode: string | null } {
  let subtotal = 0;
  let tax = 0;
  let itemCount = 0;
  const items: SnapshotItem[] = [];

  for (const line of lines) {
    const r = rows.get(line.variationId);
    if (!r || line.qty <= 0) continue;
    // Custom drink: unit price = the size's base price + validated add-ons.
    let unitPrice = r.price;
    let customSummary: string | undefined;
    if (line.custom && customData && r.pId === CUSTOM_PRODUCT_ID) {
      const rc = line.custom.recipeProductId;
      const addon = resolveCustomAddon(line.custom, customData, rc ? recipes.get(rc) : undefined);
      if (addon.ok) {
        unitPrice = r.price + addon.addonCents;
        customSummary = addon.summary;
      }
    }
    const lineSubtotal = unitPrice * line.qty;
    subtotal += lineSubtotal;
    itemCount += line.qty;
    // null → inherit global rate; 0 → exempt; else custom rate (basis points).
    const rate = r.taxRateBps == null ? s.taxRateBps : r.taxRateBps;
    const lineTax = Math.round((lineSubtotal * rate) / 10000);
    tax += lineTax;
    items.push({
      variationId: r.vId,
      productId: r.pId,
      productName: r.pName,
      variationName: r.vName,
      unitPriceCents: unitPrice,
      qty: line.qty,
      lineTotalCents: lineSubtotal,
      taxable: rate > 0,
      taxRateBps: rate,
      taxCents: lineTax,
      track: r.track,
      customSummary,
    });
  }

  // The discount (vendor rate or coupon) comes off the merchandise subtotal (not
  // tax or delivery), clamped so it can never exceed the subtotal.
  const { discountCents, appliedCouponCode } = applyDiscount(subtotal, discount);
  const feeCents = method === "delivery" ? deliveryFeeCents(itemCount, s) : 0;
  const totalCents = subtotal - discountCents + tax + feeCents;
  return {
    totals: { subtotalCents: subtotal, discountCents, taxCents: tax, feeCents, totalCents },
    items,
    appliedCouponCode,
  };
}

export type OrderQuote = OrderTotals & {
  /** The coupon code applied to this quote (null when a vendor rate or nothing
   * discounted it). */
  appliedCouponCode: string | null;
  /** true/false when a coupon code was entered (recognized or not); null when
   * none was entered — lets the UI show an "invalid code" hint. */
  couponValid: boolean | null;
};

/** Preview subtotal/discount/tax/fee/total from the DB (nothing is created). */
export async function quoteOrder(
  lines: CheckoutLine[],
  method: FulfillmentMethod = "pickup",
  email?: string,
  couponCode?: string,
): Promise<OrderQuote> {
  const s = await getSettings();
  const hasCustom = lines.some((l) => l.custom);
  const [rows, discount, customData, recipes] = await Promise.all([
    queryLineRows(lines),
    resolveDiscount(email, couponCode),
    hasCustom ? getCustomDrink() : Promise.resolve(null),
    loadRecipeContexts(lines),
  ]);
  const { totals, appliedCouponCode } = computeTotals(
    rows,
    lines,
    method,
    s,
    discount,
    customData,
    recipes,
  );
  return {
    ...totals,
    appliedCouponCode,
    couponValid: discount.couponValid,
  };
}

export type PlacedOrder = OrderTotals & {
  orderId: string;
  paymentId?: string;
  method: FulfillmentMethod;
};

function makeShortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

/** Validate, charge the card, persist the order, and decrement stock. */
export async function placeOrder(
  lines: CheckoutLine[],
  customer: Customer,
  sourceId: string,
  fulfillment: Fulfillment,
  couponCode?: string,
): Promise<PlacedOrder> {
  const s = await getSettings();

  // Final check (incl. inventory) immediately before charging.
  const validation = await validateLines(lines);
  if (!validation.ok) {
    throw new SoldOutError(validation.problems, validation.soldOut, validation.paused);
  }

  const hasCustom = lines.some((l) => l.custom);
  const [rows, discount, customData, recipes] = await Promise.all([
    queryLineRows(lines),
    resolveDiscount(customer.email, couponCode),
    hasCustom ? getCustomDrink() : Promise.resolve(null),
    loadRecipeContexts(lines),
  ]);
  const { totals, items, appliedCouponCode } = computeTotals(
    rows,
    lines,
    fulfillment.method,
    s,
    discount,
    customData,
    recipes,
  );
  if (totals.totalCents <= 0) throw new Error("Order total is invalid.");

  // Charge — Square Payments only (amount computed by us).
  const payment = await square().payments.create({
    idempotencyKey: crypto.randomUUID(),
    sourceId,
    amountMoney: { amount: BigInt(totals.totalCents), currency: "USD" as const },
    locationId: locationId(),
    autocomplete: true,
    note: `Soady Poppers online order (${fulfillment.method})`,
  });
  const sqPaymentId = payment.payment?.id;
  const paid = payment.payment?.status === "COMPLETED";

  // Persist order + items + payment and decrement inventory, atomically.
  const shortId = makeShortId();
  await db.transaction(async (tx) => {
    const [o] = await tx
      .insert(orders)
      .values({
        shortId,
        method: fulfillment.method,
        customerName: customer.name,
        customerEmail: customer.email || null,
        customerPhone: customer.phone || null,
        address:
          fulfillment.method === "delivery" ? fulfillment.address ?? null : null,
        note: customer.note || null,
        subtotalCents: totals.subtotalCents,
        discountCents: totals.discountCents,
        couponCode: appliedCouponCode,
        taxCents: totals.taxCents,
        feeCents: totals.feeCents,
        totalCents: totals.totalCents,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(
      items.map((it) => ({
        orderId: o.id,
        variationId: it.variationId,
        productName: it.productName,
        variationName: it.variationName,
        customSummary: it.customSummary ?? null,
        unitPriceCents: it.unitPriceCents,
        qty: it.qty,
        lineTotalCents: it.lineTotalCents,
        taxable: it.taxable,
        taxRateBps: it.taxRateBps,
        taxCents: it.taxCents,
      })),
    );

    await tx.insert(payments).values({
      orderId: o.id,
      squarePaymentId: sqPaymentId ?? null,
      status: paid ? "completed" : "pending",
      amountCents: totals.totalCents,
    });

    // Decrement stock for tracked products (clamped at 0).
    const decByProduct = new Map<string, number>();
    for (const it of items) {
      if (it.track) decByProduct.set(it.productId, (decByProduct.get(it.productId) ?? 0) + it.qty);
    }
    for (const [pid, qty] of decByProduct) {
      await tx
        .update(products)
        .set({ stock: sql`GREATEST(${products.stock} - ${qty}, 0)`, updatedAt: new Date() })
        .where(eq(products.id, pid));
    }
  });

  // Best-effort emails — never block the order.
  await notifyNewOrder({
    shortId,
    method: fulfillment.method,
    customerName: customer.name,
    customerEmail: customer.email || undefined,
    customerPhone: customer.phone || undefined,
    address: fulfillment.method === "delivery" ? fulfillment.address : undefined,
    note: customer.note || undefined,
    couponCode: appliedCouponCode || undefined,
    lines: items.map((it) => ({
      name: `${it.productName} (${it.variationName})`,
      qty: it.qty,
      totalCents: it.lineTotalCents,
      detail: it.customSummary,
    })),
    ...totals,
  }).catch(() => {});

  return {
    orderId: shortId,
    paymentId: sqPaymentId,
    method: fulfillment.method,
    ...totals,
  };
}
