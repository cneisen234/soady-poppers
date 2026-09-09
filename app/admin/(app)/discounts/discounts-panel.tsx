import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { vendorDiscounts } from "@/lib/db/schema";
import { createDiscount } from "./actions";
import DiscountRow from "./discount-row";
import { PERCENT_OPTIONS } from "./constants";

// Vendor-discount management, rendered as a section on the Orders page.
export default async function DiscountsPanel() {
  const rows = await db
    .select()
    .from(vendorDiscounts)
    .orderBy(asc(vendorDiscounts.email));

  return (
    <section>
      <h2 className="admin-h2">Vendor discounts</h2>
      <p className="admin-sub" style={{ marginBottom: 16 }}>
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

        <form action={createDiscount} className="admin-discount-add">
          <input
            name="email"
            type="email"
            placeholder="vendor@email.com"
            className="admin-input"
            required
          />
          <div className="admin-discount-add-row">
            <select name="ratePercent" required defaultValue="" className="admin-input sm">
              <option value="" disabled>
                % off
              </option>
              {PERCENT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}%
                </option>
              ))}
            </select>
            <button type="submit" className="admin-btn">
              + Add discount
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
