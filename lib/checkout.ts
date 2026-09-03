// Server-side checkout: validate the cart against live Square data, quote taxes
// + fees, and create the Order + Payment. Server-only (imports lib/square.ts).
//
// The charged amount always comes from Square's own pricing (we send catalog
// variation ids + quantities, never client prices), so a stale or tampered cart
// can't change what's charged — but we still re-check availability + the kill
// switch here so an order can't slip through for a sold-out or paused item.

import { square, locationId } from "@/lib/square";
import { listCatalog } from "@/lib/catalog";
import { orderingStatus } from "@/lib/ordering";
import { notifyNewOrder } from "@/lib/notifications";
import {
  deliveryFeeCents,
  isMethodAvailable,
  type FulfillmentMethod,
} from "@/lib/fulfillment";

export type CheckoutLine = { variationId: string; qty: number };
export type Customer = {
  name: string;
  email?: string;
  phone?: string;
  note?: string;
};
export type DeliveryAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};
export type Fulfillment = {
  method: FulfillmentMethod;
  address?: DeliveryAddress;
};

export type OrderTotals = {
  subtotalCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
};

export type ValidationResult = { ok: true } | { ok: false; problems: string[] };

function lineItems(lines: CheckoutLine[]) {
  return lines.map((l) => ({
    catalogObjectId: l.variationId,
    quantity: String(l.qty),
  }));
}

/** Total item count across all cart lines — drives the tiered delivery fee. */
function totalItemCount(lines: CheckoutLine[]): number {
  return lines.reduce((n, l) => n + (l.qty > 0 ? l.qty : 0), 0);
}

/** Delivery fee as a Square service charge, or none for pickup / free tiers. */
function serviceChargesFor(method: FulfillmentMethod, lines: CheckoutLine[]) {
  if (method !== "delivery") return undefined;
  const feeCents = deliveryFeeCents(totalItemCount(lines));
  if (feeCents <= 0) return undefined;
  return [
    {
      name: "Local delivery",
      amountMoney: { amount: BigInt(feeCents), currency: "USD" as const },
      calculationPhase: "SUBTOTAL_PHASE" as const,
      taxable: false,
    },
  ];
}

/** The order shape shared by quote (calculate) and checkout (create). */
function orderBase(lines: CheckoutLine[], method: FulfillmentMethod) {
  const charges = serviceChargesFor(method, lines);
  return {
    locationId: locationId(),
    lineItems: lineItems(lines),
    pricingOptions: { autoApplyTaxes: true },
    ...(charges ? { serviceCharges: charges } : {}),
  };
}

/** Re-check the cart against live catalog + the ordering kill switch. */
export async function validateLines(
  lines: CheckoutLine[],
): Promise<ValidationResult> {
  if (!orderingStatus().acceptingOrders) {
    return { ok: false, problems: ["Online ordering is currently paused."] };
  }
  if (lines.length === 0) {
    return { ok: false, problems: ["Your cart is empty."] };
  }

  const catalog = await listCatalog();
  const lookup = new Map<string, { available: boolean; name: string }>();
  for (const p of catalog.products) {
    for (const v of p.variations) {
      lookup.set(v.id, {
        available: v.available && p.available,
        name: `${p.name} (${v.name})`,
      });
    }
  }

  const problems: string[] = [];
  for (const line of lines) {
    const info = lookup.get(line.variationId);
    if (!info) {
      problems.push("An item in your cart is no longer available.");
    } else if (!info.available) {
      problems.push(`${info.name} is sold out.`);
    }
    if (!Number.isInteger(line.qty) || line.qty <= 0) {
      problems.push("An item has an invalid quantity.");
    }
  }

  return problems.length ? { ok: false, problems } : { ok: true };
}

/** Check the chosen fulfillment method is offered and has the data it needs. */
export function validateFulfillment(f: Fulfillment): ValidationResult {
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

function totalsFromOrder(order: {
  totalMoney?: { amount?: bigint | null };
  totalTaxMoney?: { amount?: bigint | null };
  totalServiceChargeMoney?: { amount?: bigint | null };
}): OrderTotals {
  const totalCents = Number(order.totalMoney?.amount ?? 0n);
  const taxCents = Number(order.totalTaxMoney?.amount ?? 0n);
  const feeCents = Number(order.totalServiceChargeMoney?.amount ?? 0n);
  return { subtotalCents: totalCents - taxCents - feeCents, taxCents, feeCents, totalCents };
}

/** Preview subtotal/tax/fee/total without creating anything (Square computes them). */
export async function quoteOrder(
  lines: CheckoutLine[],
  method: FulfillmentMethod = "pickup",
): Promise<OrderTotals> {
  const res = await square().orders.calculate({ order: orderBase(lines, method) });
  return totalsFromOrder(res.order ?? {});
}

/** Build the pickup or delivery fulfillment with the customer's details. */
function fulfillmentFor(customer: Customer, f: Fulfillment) {
  const recipient = {
    displayName: customer.name,
    emailAddress: customer.email || undefined,
    phoneNumber: customer.phone || undefined,
  };

  if (f.method === "delivery" && f.address) {
    return {
      type: "DELIVERY" as const,
      state: "PROPOSED" as const,
      deliveryDetails: {
        scheduleType: "ASAP" as const,
        recipient: {
          ...recipient,
          address: {
            addressLine1: f.address.line1,
            addressLine2: f.address.line2 || undefined,
            locality: f.address.city,
            administrativeDistrictLevel1: f.address.state,
            postalCode: f.address.zip,
            country: "US" as const,
          },
        },
        note: customer.note || undefined,
      },
    };
  }

  return {
    type: "PICKUP" as const,
    state: "PROPOSED" as const,
    pickupDetails: {
      scheduleType: "ASAP" as const,
      recipient,
      note: customer.note || undefined,
    },
  };
}

export type PlacedOrder = OrderTotals & {
  orderId: string;
  paymentId?: string;
  method: FulfillmentMethod;
};

/** Create the Order (pickup or delivery), then charge the card. */
export async function placeOrder(
  lines: CheckoutLine[],
  customer: Customer,
  sourceId: string,
  fulfillment: Fulfillment,
): Promise<PlacedOrder> {
  const created = await square().orders.create({
    idempotencyKey: crypto.randomUUID(),
    order: {
      ...orderBase(lines, fulfillment.method),
      fulfillments: [fulfillmentFor(customer, fulfillment)],
    },
  });

  const order = created.order;
  if (!order?.id || !order.totalMoney) {
    throw new Error("Order creation failed.");
  }

  const payment = await square().payments.create({
    idempotencyKey: crypto.randomUUID(),
    sourceId,
    amountMoney: order.totalMoney,
    orderId: order.id,
    locationId: locationId(),
    autocomplete: true,
  });

  const totals = totalsFromOrder(order);

  // Best-effort: SMS the shop + email the customer. Never blocks the order.
  await notifyNewOrder({
    orderId: order.id,
    method: fulfillment.method,
    customerName: customer.name,
    customerEmail: customer.email || undefined,
    customerPhone: customer.phone || undefined,
    address: fulfillment.method === "delivery" ? fulfillment.address : undefined,
    note: customer.note || undefined,
    lines: (order.lineItems ?? []).map((li) => ({
      name: li.name ?? "Item",
      qty: Number(li.quantity ?? "1"),
      totalCents: Number(li.totalMoney?.amount ?? 0n),
    })),
    ...totals,
  }).catch(() => {});

  return {
    orderId: order.id,
    paymentId: payment.payment?.id,
    method: fulfillment.method,
    ...totals,
  };
}
