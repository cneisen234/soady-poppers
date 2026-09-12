"use client";

import { useRef, useState } from "react";
import { updateSize, deleteSize } from "./size-actions";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";
import { useAutosave, SaveStatus } from "../../autosave";

export default function SizeRow({
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price: string;
}) {
  const [f, setF] = useState({ name, price });
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
      fd.set("price", v.price);
      await updateSize(fd);
    });
  }

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <input
          className="admin-input"
          aria-label="Size name"
          value={f.name}
          onChange={(e) => change("name", e.target.value)}
        />
      </div>
      <input
        className="admin-input w-24"
        type="text"
        inputMode="decimal"
        aria-label="Size price"
        placeholder="$"
        value={f.price}
        onChange={(e) => change("price", e.target.value.replace(/[^0-9.]/g, ""))}
      />
      <SaveStatus status={status} />
      <ConfirmDelete
        action={deleteSize}
        fields={{ id }}
        title={`Remove the ${name} size?`}
        triggerLabel={<TrashIcon />}
        triggerAriaLabel="Remove size"
      />
    </div>
  );
}
