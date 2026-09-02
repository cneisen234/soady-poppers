// Manual master switch for online ordering.
//
// Square has no "pause the whole store" flag for a custom storefront, so this
// boolean is our single source of truth. Flip ACCEPTING_ORDERS to false to turn
// ordering off site-wide: the storefront hides checkout and the checkout API
// rejects new orders (enforcement lands in Steps 3 & 4). This is a deliberate
// code-level toggle — updating it is a small, intentional change.
//
// IMPORTANT: business hours do NOT gate ordering. The shop accepts orders 24/7;
// when closed, the storefront tells the customer their order will be fulfilled at
// the next opening time (built from getOpenStatus().sub in lib/status.ts).
// Ordering only stops when the switch below is off, or an individual item is
// marked Sold Out in the Square dashboard.

/** Master on/off for online ordering. Set to false to pause the whole store. */
export const ACCEPTING_ORDERS = true;

/** Customer-facing note shown when ordering is paused. */
export const ORDERING_PAUSED_MESSAGE =
  "Online ordering is temporarily paused — check back soon!";

export type OrderingStatus = {
  acceptingOrders: boolean;
  message?: string;
};

export function orderingStatus(): OrderingStatus {
  return ACCEPTING_ORDERS
    ? { acceptingOrders: true }
    : { acceptingOrders: false, message: ORDERING_PAUSED_MESSAGE };
}
