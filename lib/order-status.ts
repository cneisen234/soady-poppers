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

export function isCompleted(s: string): boolean {
  return (COMPLETED_STATUSES as readonly string[]).includes(s);
}

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
  if (method === "delivery") {
    return [
      { status: "new", label: "New" },
      { status: "out_for_delivery", label: "Out for Delivery" },
      { status: "completed", label: "Done" },
    ];
  }
  return [
    { status: "new", label: "New" },
    { status: "ready", label: "Ready for Pickup" },
    { status: "completed", label: "Done" },
  ];
}
