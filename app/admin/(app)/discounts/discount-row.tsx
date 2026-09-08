"use client";

import { useRef, useState } from "react";
import { updateDiscount, deleteDiscount } from "./actions";
import ConfirmDelete from "../confirm-delete";
import { TrashIcon } from "../icons";
import { useAutosave, SaveStatus } from "../autosave";

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
      <div className="admin-rate">
        <input
          className="admin-input sm w-24"
          type="number"
          step="0.01"
          min="0"
          aria-label="Discount percent"
          value={f.ratePercent}
          onChange={(e) => update("ratePercent", e.target.value)}
        />
        <span className="admin-rate-suffix">%</span>
      </div>
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
