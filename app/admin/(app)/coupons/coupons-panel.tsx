import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import CouponRow from "./coupon-row";
import CouponAddForm from "./coupon-add-form";

// Coupon management, rendered as a section on the Orders page.
export default async function CouponsPanel() {
  const rows = await db.select().from(coupons).orderBy(asc(coupons.code));

  return (
    <section>
      <h2 className="admin-h2">Coupons</h2>
      <p className="admin-sub" style={{ marginBottom: 16 }}>
        Codes a customer types at checkout for a percent or flat amount off the item
        subtotal. Switch one off to pause it without deleting.
      </p>

      <div className="admin-card">
        {rows.map((c) => (
          <CouponRow
            key={c.id}
            id={c.id}
            code={c.code}
            kind={c.kind}
            ratePercent={(c.discountBps / 100).toString()}
            amountDollars={c.amountOffCents != null ? (c.amountOffCents / 100).toFixed(2) : ""}
            active={c.active}
          />
        ))}
        {rows.length === 0 && (
          <p className="admin-stub" style={{ margin: "6px 0" }}>
            No coupons yet.
          </p>
        )}

        <CouponAddForm />
      </div>
    </section>
  );
}
