"use client";

import { useRef, useState } from "react";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";
import { useAutosave, SaveStatus } from "../../autosave";

// A simple name + active list row, shared by the Bases and Milks lists. The
// concrete server actions are passed in so one component serves both.
export default function OptionRow({
  id,
  name,
  active,
  update,
  remove,
  label,
}: {
  id: string;
  name: string;
  active: boolean;
  update: (fd: FormData) => Promise<void>;
  remove: (fd: FormData) => Promise<void>;
  label: string;
}) {
  const [f, setF] = useState({ name, active });
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
      fd.set("active", v.active ? "1" : "0");
      await update(fd);
    });
  }

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <input
          className="admin-input"
          aria-label={`${label} name`}
          value={f.name}
          onChange={(e) => change("name", e.target.value)}
        />
      </div>
      <label className="admin-toggle" title={f.active ? "Active" : "Off"}>
        <input
          type="checkbox"
          checked={f.active}
          onChange={(e) => change("active", e.target.checked)}
          aria-label={`${label} active`}
        />
        <span>{f.active ? "Active" : "Off"}</span>
      </label>
      <SaveStatus status={status} />
      <ConfirmDelete
        action={remove}
        fields={{ id }}
        title={`Remove ${name}?`}
        triggerLabel={<TrashIcon />}
        triggerAriaLabel={`Remove ${label}`}
      />
    </div>
  );
}
