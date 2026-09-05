"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { square } from "@/lib/square";
import { notifyOrderStatus } from "@/lib/notifications";
import { flashToast } from "../flash";
import { field } from "@/lib/form";
import { stepsForMethod, statusLabel, type OrderStatus } from "@/lib/order-status";

/**
 * Advance an order to a later step in its method's flow. Forward-only: you can't
 * move back a step, and terminal orders (refunded/cancelled) can't be changed.
 * Emails the customer when it becomes ready / out for delivery.
 */
export async function advanceOrderStatus(id: string, status: string): Promise<void> {
  await requireAdmin();
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return;

  const steps = stepsForMethod(order.method);
  const curIdx = steps.findIndex((s) => s.status === order.status);
  const newIdx = steps.findIndex((s) => s.status === status);
  // Must be a real step, must move forward, and the order must be on the ladder.
  if (curIdx < 0 || newIdx < 0 || newIdx <= curIdx) return;

  await db
    .update(orders)
    .set({ status: status as OrderStatus, updatedAt: new Date() })
    .where(eq(orders.id, id));

  if (status === "ready" || status === "out_for_delivery") {
    await notifyOrderStatus({
      shortId: order.shortId,
      customerName: order.customerName,
      customerEmail: order.customerEmail ?? undefined,
      status,
    }).catch(() => {});
    await flashToast(`Marked ${statusLabel(status)} · customer emailed`);
  } else {
    await flashToast(`Marked ${statusLabel(status)}`);
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function refundOrder(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;

  const [pay] = await db.select().from(payments).where(eq(payments.orderId, id));
  if (!pay?.squarePaymentId || pay.status === "refunded") {
    await flashToast("Nothing to refund");
    revalidatePath(`/admin/orders/${id}`);
    return;
  }

  try {
    await square().refunds.refundPayment({
      idempotencyKey: crypto.randomUUID(),
      paymentId: pay.squarePaymentId,
      amountMoney: { amount: BigInt(pay.amountCents), currency: "USD" as const },
      reason: "Refunded by Soady Poppers",
    });
    await db
      .update(payments)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(payments.id, pay.id));
    await db
      .update(orders)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(orders.id, id));
    await flashToast("Order refunded");
  } catch {
    await flashToast("Refund failed — check Square");
  }
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}
