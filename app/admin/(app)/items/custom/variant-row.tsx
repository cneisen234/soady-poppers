"use client";

import { useRef, useState } from "react";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";
import { useAutosave, SaveStatus } from "../../autosave";
import { LeafIcon } from "./leaf-icon";

// A name + regular/sugar-free + active row — shared by the Bases and Syrups
// lists (both are "flavors" offered regular and/or sugar-free). The concrete
// update/remove actions are passed in.
export default function VariantRow({
  id,
  name,
  availableRegular,
  availableSugarFree,
  active,
  update,
  remove,
  label,
}: {
  id: string;
  name: string;
  availableRegular: boolean;
  availableSugarFree: boolean;
  active: boolean;
  update: (fd: FormData) => Promise<void>;
  remove: (fd: FormData) => Promise<void>;
  label: string;
}) {
  const [f, setF] = useState({ name, availableRegular, availableSugarFree, active });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function change<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    schedule(async () => {
      const v = latest.current;
      const fd = new FormData();
      fd.set("id", id);
      fd.set("name", v.name);
      fd.set("regular", v.availableRegular ? "1" : "0");
      fd.set("sugarFree", v.availableSugarFree ? "1" : "0");
      fd.set("active", v.active ? "1" : "0");
      await update(fd);
    });
  }

  return (
    <div className="admin-optlist-row">
      <div className="admin-optlist-line">
        <div className="admin-list-main">
          <input
            className="admin-input"
            aria-label={`${label} name`}
            value={f.name}
            onChange={(e) => change("name", e.target.value)}
          />
        </div>
        {/* Fixed-width slot so the icon never shifts the name field's alignment. */}
        <span className="admin-syrup-flag">
          {f.availableSugarFree && <LeafIcon title="Available sugar-free" />}
        </span>
        <ConfirmDelete
          action={remove}
          fields={{ id }}
          title={`Remove ${name}?`}
          triggerLabel={<TrashIcon />}
          triggerAriaLabel={`Remove ${label}`}
        />
      </div>
      <div className="admin-optlist-line">
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={f.availableRegular}
            onChange={(e) => change("availableRegular", e.target.checked)}
            aria-label="Available regular"
          />
          <span>Regular</span>
        </label>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={f.availableSugarFree}
            onChange={(e) => change("availableSugarFree", e.target.checked)}
            aria-label="Available sugar-free"
          />
          <span>Sugar-free</span>
        </label>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={f.active}
            onChange={(e) => change("active", e.target.checked)}
            aria-label={`${label} active`}
          />
          <span>{f.active ? "Active" : "Off"}</span>
        </label>
        <SaveStatus status={status} />
      </div>
    </div>
  );
}
