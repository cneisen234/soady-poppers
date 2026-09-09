"use client";

import { useRef, useState } from "react";
import { updateDiscount, deleteDiscount } from "./actions";
import ConfirmDelete from "../confirm-delete";
import { TrashIcon } from "../icons";
import { useAutosave, SaveStatus } from "../autosave";
import { PERCENT_OPTIONS } from "./constants";

export default function DiscountRow({
  id,
  email,
  ratePercent,
}: {
  id: string;
  email: string;
  ratePercent: string;
}) {
  const [f, setF] = useState({ email, ratePercent });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function update<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    schedule(async () => {
      const v = latest.current;
      const fd = new FormData();
      fd.set("id", id);
      fd.set("email", v.email);
      fd.set("ratePercent", v.ratePercent);
      await updateDiscount(fd);
    });
  }

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <input
          className="admin-input"
          type="email"
          aria-label="Customer email"
          value={f.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <select
        className="admin-input sm"
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
      <SaveStatus status={status} />
      <ConfirmDelete
        action={deleteDiscount}
        fields={{ id }}
        title={`Remove the discount for ${email}?`}
        triggerLabel={<TrashIcon />}
        triggerAriaLabel="Remove discount"
      />
    </div>
  );
}
