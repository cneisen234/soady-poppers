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
import { notifyNewOrder } from "@/lib/notifications";
import { isMethodAvailable, type FulfillmentMethod } from "@/lib/fulfillment";

export type { DeliveryAddress };
export type CheckoutLine = { variationId: string; qty: number };
export type Customer = { name: string; email?: string; phone?: string; note?: string };
export type Fulfillment = { method: FulfillmentMethod; address?: DeliveryAddress };

export type OrderTotals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
};

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
};

function computeTotals(
  rows: Map<string, LineRow>,
  lines: CheckoutLine[],
  method: FulfillmentMethod,
  s: Settings,
  discountBps = 0,
): { totals: OrderTotals; items: SnapshotItem[] } {
  let subtotal = 0;
  let tax = 0;
  let itemCount = 0;
  const items: SnapshotItem[] = [];

  for (const line of lines) {
    const r = rows.get(line.variationId);
    if (!r || line.qty <= 0) continue;
    const lineSubtotal = r.price * line.qty;
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
      unitPriceCents: r.price,
      qty: line.qty,
      lineTotalCents: lineSubtotal,
      taxable: rate > 0,
      taxRateBps: rate,
      taxCents: lineTax,
      track: r.track,
    });
  }

  // Vendor discount comes off the merchandise subtotal (not tax or delivery),
  // clamped so it can never exceed the subtotal.
  const discountCents = Math.min(subtotal, Math.round((subtotal * discountBps) / 10000));
  const feeCents = method === "delivery" ? deliveryFeeCents(itemCount, s) : 0;
  const totalCents = subtotal - discountCents + tax + feeCents;
  return {
    totals: { subtotalCents: subtotal, discountCents, taxCents: tax, feeCents, totalCents },
    items,
  };
}

/** Preview subtotal/discount/tax/fee/total from the DB (nothing is created). */
export async function quoteOrder(
  lines: CheckoutLine[],
  method: FulfillmentMethod = "pickup",
  email?: string,
): Promise<OrderTotals> {
  const s = await getSettings();
  const [rows, discountBps] = await Promise.all([
    queryLineRows(lines),
    discountBpsForEmail(email),
  ]);
  return computeTotals(rows, lines, method, s, discountBps).totals;
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
): Promise<PlacedOrder> {
  const s = await getSettings();

  // Final check (incl. inventory) immediately before charging.
  const validation = await validateLines(lines);
  if (!validation.ok) {
    throw new SoldOutError(validation.problems, validation.soldOut, validation.paused);
  }

  const [rows, discountBps] = await Promise.all([
    queryLineRows(lines),
    discountBpsForEmail(customer.email),
  ]);
  const { totals, items } = computeTotals(rows, lines, fulfillment.method, s, discountBps);
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
    lines: items.map((it) => ({
      name: `${it.productName} (${it.variationName})`,
      qty: it.qty,
      totalCents: it.lineTotalCents,
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
