"use client";

export type CouponKind = "percent" | "fixed";

// A segmented %/$ toggle for choosing whether a coupon is a percentage or a flat
// dollar amount. Only the chosen side's value field is shown by the caller.
export default function KindToggle({
  value,
  onChange,
}: {
  value: CouponKind;
  onChange: (v: CouponKind) => void;
}) {
  return (
    <div className="admin-seg" role="group" aria-label="Discount type">
      <button
        type="button"
        className={value === "percent" ? "active" : ""}
        aria-pressed={value === "percent"}
        onClick={() => onChange("percent")}
      >
        %
      </button>
      <button
        type="button"
        className={value === "fixed" ? "active" : ""}
        aria-pressed={value === "fixed"}
        onClick={() => onChange("fixed")}
      >
        $
      </button>
    </div>
  );
}
