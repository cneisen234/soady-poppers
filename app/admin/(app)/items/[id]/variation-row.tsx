"use client";

import { useRef, useState } from "react";
import { saveVariation, deleteVariation } from "../actions";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";
import { useAutosave, SaveStatus } from "../../autosave";

type V = {
  id: string;
  name: string;
  priceCents: number;
  sku: string | null;
  available: boolean;
  soldOut: boolean;
};

type Fields = {
  name: string;
  price: string;
  sku: string;
  available: boolean;
  soldOut: boolean;
};

export default function VariationRow({ v, productId }: { v: V; productId: string }) {
  const [f, setF] = useState<Fields>({
    name: v.name,
    price: (v.priceCents / 100).toFixed(2),
    sku: v.sku ?? "",
    available: v.available,
    soldOut: v.soldOut,
  });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    schedule(async () => {
      const c = latest.current;
      const fd = new FormData();
      fd.set("id", v.id);
      fd.set("productId", productId);
      fd.set("name", c.name);
      fd.set("price", c.price);
      fd.set("sku", c.sku);
      if (c.available) fd.set("available", "on");
      if (c.soldOut) fd.set("soldOut", "on");
      await saveVariation(fd);
    });
  }

  return (
    <tr>
      <td data-label="Name">
        <input
          className="admin-input sm"
          value={f.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </td>
      <td className="admin-num" data-label="Price">
        <input
          className="admin-input sm w-24"
          type="number"
          step="0.01"
          min="0"
          value={f.price}
          onChange={(e) => update("price", e.target.value)}
        />
      </td>
      <td data-label="SKU">
        <input
          className="admin-input sm"
          value={f.sku}
          onChange={(e) => update("sku", e.target.value)}
        />
      </td>
      <td className="admin-center" data-label="Available">
        <input
          type="checkbox"
          checked={f.available}
          onChange={(e) => update("available", e.target.checked)}
        />
      </td>
      <td className="admin-center" data-label="Sold out">
        <input
          type="checkbox"
          checked={f.soldOut}
          onChange={(e) => update("soldOut", e.target.checked)}
        />
      </td>
      <td className="admin-num">
        <div className="admin-actions" style={{ alignItems: "center" }}>
          <SaveStatus status={status} />
          <ConfirmDelete
            action={deleteVariation}
            fields={{ id: v.id, productId }}
            title={`Delete the “${v.name}” size?`}
            triggerLabel={<TrashIcon />}
            triggerAriaLabel="Delete size"
          />
        </div>
      </td>
    </tr>
  );
}
