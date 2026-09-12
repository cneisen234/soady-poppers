import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/uuid";
import { refundOrder } from "../actions";
import { statusLabel, statusTagClass } from "@/lib/order-status";
import { formatCents } from "@/lib/money";
import { formatOrderTime } from "@/lib/datetime";
import { formatAddress } from "@/lib/address";
import StatusStepper from "./status-stepper";
import ConfirmDelete from "../../confirm-delete";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // A non-UUID id would otherwise 500 in the query — treat it as not found.
  if (!isUuid(id)) notFound();
  const order = await db.query.orders.findFirst({
    where: (o, { eq }) => eq(o.id, id),
    with: { items: true, payments: true },
  });
  if (!order) notFound();

  const payment = order.payments[0];
  const refunded = payment?.status === "refunded";
  const addr = order.address;

  return (
    <>
      <Link href="/admin/orders" className="admin-link">
        ← Orders
      </Link>
      <div className="admin-row-between" style={{ marginTop: 6, alignItems: "center" }}>
        <h1 className="admin-h1" style={{ margin: 0 }}>
          Order #{order.shortId}
        </h1>
        <span className={`admin-tag ${statusTagClass(order.status)}`}>
          {statusLabel(order.status)}
        </span>
      </div>
      <p className="admin-sub" style={{ marginTop: 8 }}>
        {formatOrderTime(order.createdAt, { weekday: true })} ·{" "}
        <span style={{ textTransform: "capitalize" }}>{order.method}</span>
      </p>

      {/* Status stepper + refund */}
      <div className="admin-card">
        <h2 className="admin-h2">Status</h2>
        <StatusStepper orderId={order.id} method={order.method} status={order.status} />
        <div className="admin-actions" style={{ justifyContent: "flex-start", marginTop: 16 }}>
          {payment?.squarePaymentId && !refunded ? (
            <ConfirmDelete
              action={refundOrder}
              fields={{ id: order.id }}
              title={`Refund order #${order.shortId}?`}
              message={`This refunds ${formatCents(order.totalCents)} to the customer's card and marks the order refunded.`}
              triggerClass="admin-btn sm danger"
              triggerLabel="Refund order"
              triggerAriaLabel="Refund order"
              confirmLabel="Refund"
            />
          ) : refunded ? (
            <p className="admin-sub" style={{ margin: 0 }}>
              This order was refunded.
            </p>
          ) : null}
        </div>
      </div>

      {/* Customer */}
      <div className="admin-card">
        <h2 className="admin-h2">Customer</h2>
        <ul className="kv admin-kv">
          <li>
            <span className="k">Name</span>
            <span className="v">{order.customerName}</span>
          </li>
          {order.customerPhone && (
            <li>
              <span className="k">Phone</span>
              <span className="v">
                <a href={`tel:${order.customerPhone}`} className="admin-link">
                  {order.customerPhone}
                </a>
              </span>
            </li>
          )}
          {order.customerEmail && (
            <li>
              <span className="k">Email</span>
              <span className="v">
                <a href={`mailto:${order.customerEmail}`} className="admin-link">
                  {order.customerEmail}
                </a>
              </span>
            </li>
          )}
          {order.method === "delivery" && addr && (
            <li>
              <span className="k">Deliver to</span>
              <span className="v">{formatAddress(addr)}</span>
            </li>
          )}
          {order.note && (
            <li>
              <span className="k">Note</span>
              <span className="v">{order.note}</span>
            </li>
          )}
        </ul>
      </div>

      {/* Items */}
      <div className="admin-card">
        <h2 className="admin-h2">Items</h2>
        <div className="admin-tablewrap">
          <table className="admin-table cards item-cards">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Each</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td data-label="Item">
                    {it.productName} · {it.variationName}
                    {it.customSummary && (
                      <span
                        className="admin-sub"
                        style={{ display: "block", margin: "2px 0 0" }}
                      >
                        {it.customSummary}
                      </span>
                    )}
                  </td>
                  <td className="admin-num" data-label="Qty">
                    {it.qty}
                  </td>
                  <td className="admin-num" data-label="Each">
                    {formatCents(it.unitPriceCents)}
                  </td>
                  <td className="admin-num" data-label="Total">
                    {formatCents(it.lineTotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="kv admin-kv" style={{ marginTop: 16 }}>
          <li>
            <span className="k">Subtotal</span>
            <span className="v admin-num">{formatCents(order.subtotalCents)}</span>
          </li>
          {order.discountCents > 0 && (
            <li>
              <span className="k">
                {order.couponCode ? `Coupon (${order.couponCode})` : "Vendor discount"}
              </span>
              <span className="v admin-num">-{formatCents(order.discountCents)}</span>
            </li>
          )}
          {order.feeCents > 0 && (
            <li>
              <span className="k">Delivery</span>
              <span className="v admin-num">{formatCents(order.feeCents)}</span>
            </li>
          )}
          <li>
            <span className="k">Tax</span>
            <span className="v admin-num">{formatCents(order.taxCents)}</span>
          </li>
          <li>
            <span className="k" style={{ fontWeight: 700 }}>Total</span>
            <span className="v admin-num" style={{ fontWeight: 700 }}>
              {formatCents(order.totalCents)}
            </span>
          </li>
          {payment && (
            <li>
              <span className="k">Payment</span>
              <span className="v" style={{ textTransform: "capitalize" }}>
                {payment.status}
                {payment.squarePaymentId ? ` · ${payment.squarePaymentId}` : ""}
              </span>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
