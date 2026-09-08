import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { vendorDiscounts } from "@/lib/db/schema";
import { createDiscount } from "./actions";
import DiscountRow from "./discount-row";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  const rows = await db
    .select()
    .from(vendorDiscounts)
    .orderBy(asc(vendorDiscounts.email));

  return (
    <>
      <h1 className="admin-h1">Vendor discounts</h1>
      <p className="admin-sub">
        Customers whose checkout email matches one of these get the listed percent off the
        item subtotal automatically.
      </p>

      <div className="admin-card">
        {rows.map((d) => (
          <DiscountRow
            key={d.id}
            id={d.id}
            email={d.email}
            ratePercent={(d.discountBps / 100).toString()}
          />
        ))}
        {rows.length === 0 && (
          <p className="admin-stub" style={{ margin: "6px 0" }}>
            No vendor discounts yet.
          </p>
        )}

        <form action={createDiscount} className="admin-list-add">
          <input
            name="email"
            type="email"
            placeholder="vendor@email.com"
            className="admin-input"
            required
          />
          <input
            name="ratePercent"
            type="number"
            step="0.01"
            min="0"
            placeholder="% off"
            className="admin-input sm w-24"
            required
          />
          <button type="submit" className="admin-btn">
            + Add discount
          </button>
        </form>
      </div>
    </>
  );
}
