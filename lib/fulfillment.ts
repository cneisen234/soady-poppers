// Fulfillment configuration — which methods are offered and their fees.
//
// Launch scope (the owners' decision from the planning meeting): pickup + local
// delivery, for drinks. SHIPPING is intentionally stubbed OFF until:
//   1. popcorn clears the health department (it's the only shippable product),
//   2. out-of-state food shipping clears with the health department, and
//   3. a rate method is chosen — Square's API does NOT quote carrier rates for a
//      custom storefront, so this will be a flat/tiered fee we set, or a provider
//      like EasyPost/Shippo. Flip SHIPPING_ENABLED on once those are settled.

export type FulfillmentMethod = "pickup" | "delivery" | "shipping";

export const DELIVERY_ENABLED = true;
export const SHIPPING_ENABLED = false;

// Per-item local-delivery fee, in cents. A business setting the owners choose —
// applied as a Square service charge so it's part of the order total.
export const DELIVERY_FEE_PER_ITEM_CENTS = 200;

// Flat fee for mid-size orders, in cents (see deliveryFeeCents tiers).
export const DELIVERY_FEE_FLAT_CENTS = 500;

/**
 * Local-delivery fee for an order, by total item count:
 *   1–4 items:  $2 per item
 *   5–9 items:  flat $5
 *   10+ items:  free
 */
export function deliveryFeeCents(itemCount: number): number {
  if (itemCount >= 10) return 0;
  if (itemCount >= 5) return DELIVERY_FEE_FLAT_CENTS;
  return Math.max(0, itemCount) * DELIVERY_FEE_PER_ITEM_CENTS;
}

/** Methods offered to customers right now. */
export function availableMethods(): FulfillmentMethod[] {
  const methods: FulfillmentMethod[] = ["pickup"];
  if (DELIVERY_ENABLED) methods.push("delivery");
  if (SHIPPING_ENABLED) methods.push("shipping");
  return methods;
}

export function isMethodAvailable(m: FulfillmentMethod): boolean {
  return availableMethods().includes(m);
}
