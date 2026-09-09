"use client";

import { useRef, useState } from "react";
import { createCoupon } from "./actions";
import KindToggle from "./kind-toggle";
import { PERCENT_OPTIONS } from "./constants";

// The "add coupon" form. A client component so the value control can swap
// between a percent dropdown and a flat-dollar input as the type changes.
export default function CouponAddForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<"percent" | "fixed">("percent");

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await createCoupon(fd);
        formRef.current?.reset();
        setKind("percent");
      }}
      className="admin-coupon-add"
    >
      {/* Line 1 — the code. */}
      <div className="admin-coupon-line">
        <div className="admin-list-main">
          <input
            name="code"
            type="text"
            placeholder="CODE (e.g. SAVE10)"
            aria-label="Coupon code"
            autoCapitalize="characters"
            autoComplete="off"
            className="admin-input"
            style={{ textTransform: "uppercase" }}
            required
          />
        </div>
        <label className="admin-toggle" title="New coupons start active">
          <input type="checkbox" name="active" value="1" defaultChecked />
          <span>Active</span>
        </label>
      </div>

      {/* Line 2 — the discount + add button. */}
      <div className="admin-coupon-line">
        {/* Buttons don't post a value, so mirror the toggle into a hidden field. */}
        <input type="hidden" name="kind" value={kind} />
        <KindToggle value={kind} onChange={setKind} />
        {kind === "percent" ? (
          <select name="ratePercent" required defaultValue="" className="admin-input">
            <option value="" disabled>
              % off
            </option>
            {PERCENT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}%
              </option>
            ))}
          </select>
        ) : (
          <input
            name="amountDollars"
            type="text"
            inputMode="decimal"
            required
            placeholder="$ off"
            aria-label="Discount dollars"
            className="admin-input w-16"
          />
        )}
        <button type="submit" className="admin-btn admin-coupon-spacer">
          + Add coupon
        </button>
      </div>
    </form>
  );
}
