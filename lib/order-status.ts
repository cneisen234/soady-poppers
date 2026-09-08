// Order-status helpers — plain module (no server-only), shared by the orders
// pages, the status stepper, and the paginated API.

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled"
  | "refunded";

export const ACTIVE_STATUSES = ["new", "preparing", "ready", "out_for_delivery"] as const;
export const COMPLETED_STATUSES = ["completed", "cancelled", "refunded"] as const;

export function statusLabel(s: string): string {
  switch (s) {
    case "new":
      return "New";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready for Pickup";
    case "out_for_delivery":
      return "Out for Delivery";
    case "completed":
      return "Done";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return s;
  }
}

/** Tag color class (see .admin-tag.* in admin.css). */
export function statusTagClass(s: string): string {
  switch (s) {
    case "new":
      return "warn";
    case "ready":
    case "out_for_delivery":
      return "info";
    case "completed":
      return "on";
    case "refunded":
    case "cancelled":
      return "bad";
    default:
      return "muted";
  }
}

export type Step = { status: OrderStatus; label: string };

/** The forward step sequence for an order's fulfillment method. */
export function stepsForMethod(method: string): Step[] {
  const statuses: OrderStatus[] =
    method === "delivery"
      ? ["new", "out_for_delivery", "completed"]
      : ["new", "ready", "completed"];
  return statuses.map((status) => ({ status, label: statusLabel(status) }));
}
