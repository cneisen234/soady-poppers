"use client";

import { useRef, useState } from "react";
import { updateCoupon, deleteCoupon } from "./actions";
import ConfirmDelete from "../confirm-delete";
import { TrashIcon } from "../icons";
import { useAutosave, SaveStatus } from "../autosave";
import KindToggle from "./kind-toggle";
import { PERCENT_OPTIONS } from "./constants";

export default function CouponRow({
  id,
  code,
  kind,
  ratePercent,
  amountDollars,
  active,
}: {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  ratePercent: string;
  amountDollars: string;
  active: boolean;
}) {
  const [f, setF] = useState({ code, kind, ratePercent, amountDollars, active });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function update<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    schedule(async () => {
      const v = latest.current;
      const fd = new FormData();
      fd.set("id", id);
      fd.set("code", v.code);
      fd.set("kind", v.kind);
      fd.set("ratePercent", v.ratePercent);
      fd.set("amountDollars", v.amountDollars);
      fd.set("active", v.active ? "1" : "0");
      await updateCoupon(fd);
    });
  }

  return (
    <div className="admin-coupon-row">
      {/* Line 1 — the code, with active + delete on the right. */}
      <div className="admin-coupon-line">
        <div className="admin-list-main">
          <input
            className="admin-input"
            type="text"
            aria-label="Coupon code"
            autoCapitalize="characters"
            value={f.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            style={{ textTransform: "uppercase" }}
          />
        </div>
        <label className="admin-toggle" title={f.active ? "Active" : "Off"}>
          <input
            type="checkbox"
            checked={f.active}
            onChange={(e) => update("active", e.target.checked)}
            aria-label="Coupon active"
          />
          <span>{f.active ? "Active" : "Off"}</span>
        </label>
        <ConfirmDelete
          action={deleteCoupon}
          fields={{ id }}
          title={`Remove coupon ${code}?`}
          triggerLabel={<TrashIcon />}
          triggerAriaLabel="Remove coupon"
        />
      </div>

      {/* Line 2 — the discount: type toggle + its value. */}
      <div className="admin-coupon-line">
        <KindToggle value={f.kind} onChange={(v) => update("kind", v)} />
        {f.kind === "percent" ? (
          <select
            className="admin-input"
            aria-label="Discount percent"
            value={f.ratePercent}
            onChange={(e) => update("ratePercent", e.target.value)}
          >
            {/* Keep any legacy non-multiple-of-5 rate selectable. */}
            {f.ratePercent !== "" && !PERCENT_OPTIONS.map(String).includes(f.ratePercent) && (
              <option value={f.ratePercent}>{f.ratePercent}%</option>
            )}
            {PERCENT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}%
              </option>
            ))}
          </select>
        ) : (
          <input
            className="admin-input w-16"
            type="text"
            inputMode="decimal"
            aria-label="Discount dollars"
            placeholder="$ off"
            value={f.amountDollars}
            onChange={(e) => update("amountDollars", e.target.value.replace(/[^0-9.]/g, ""))}
          />
        )}
        <SaveStatus status={status} />
      </div>
    </div>
  );
}
