"use client";

import { useRef, useState } from "react";
import { updateProduct } from "../actions";
import { useAutosave, SaveStatus } from "../../autosave";

type Cat = { id: string; name: string; baseNames: string[] };
type Named = { id: string; name: string };
type Recipe = { syrupIds: string[]; toppingIds: string[] };

type ProductLite = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  available: boolean;
  hidden: boolean;
  taxRateBps: number | null;
  trackInventory: boolean;
  stock: number;
};

type Fields = {
  name: string;
  description: string;
  categoryId: string;
  available: boolean;
  visible: boolean;
  taxMode: "inherit" | "exempt" | "custom";
  taxRatePercent: string;
  trackInventory: boolean;
  stock: string;
  syrupIds: string[];
  toppingIds: string[];
};

export default function ProductDetailsForm({
  product,
  categories,
  recipe,
  pools,
}: {
  product: ProductLite;
  categories: Cat[];
  recipe: Recipe | null;
  pools: { syrups: Named[]; toppings: Named[] };
}) {
  const [f, setF] = useState<Fields>({
    name: product.name,
    description: product.description ?? "",
    categoryId: product.categoryId ?? "",
    available: product.available,
    visible: !product.hidden,
    taxMode:
      product.taxRateBps == null ? "inherit" : product.taxRateBps === 0 ? "exempt" : "custom",
    taxRatePercent:
      product.taxRateBps && product.taxRateBps > 0 ? String(product.taxRateBps / 100) : "",
    trackInventory: product.trackInventory,
    stock: String(product.stock),
    syrupIds: recipe?.syrupIds ?? [],
    toppingIds: recipe?.toppingIds ?? [],
  });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    schedule(async () => {
      const v = latest.current;
      const fd = new FormData();
      fd.set("id", product.id);
      fd.set("name", v.name);
      fd.set("description", v.description);
      fd.set("categoryId", v.categoryId);
      if (v.available) fd.set("available", "on");
      if (v.visible) fd.set("visible", "on");
      fd.set("taxMode", v.taxMode);
      fd.set("taxRatePercent", v.taxRatePercent);
      if (v.trackInventory) fd.set("trackInventory", "on");
      fd.set("stock", v.stock);
      fd.set("recipeSyrups", JSON.stringify(v.syrupIds));
      fd.set("recipeToppings", JSON.stringify(v.toppingIds));
      await updateProduct(fd);
    });
  }

  function toggleId(key: "syrupIds" | "toppingIds", id: string) {
    const cur = latest.current[key];
    update(key, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }

  return (
    <div className="admin-card admin-form">
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <h2 className="admin-h2" style={{ margin: 0 }}>
          Details
        </h2>
        <SaveStatus status={status} />
      </div>

      <label className="admin-field">
        <span>Name</span>
        <input
          className="admin-input"
          value={f.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </label>

      <label className="admin-field">
        <span>Description</span>
        <textarea
          className="admin-input"
          rows={2}
          value={f.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      <label className="admin-field">
        <span>Category</span>
        <select
          className="admin-input"
          value={f.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-grid2">
        <label className="admin-check">
          <input
            type="checkbox"
            checked={f.available}
            onChange={(e) => update("available", e.target.checked)}
          />
          <span>Available (turn off to pause this item)</span>
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={f.visible}
            onChange={(e) => update("visible", e.target.checked)}
          />
          <span>Visible on storefront</span>
        </label>
      </div>

      <fieldset className="admin-fieldset">
        <legend>Tax</legend>
        <div className="admin-grid2">
          <label className="admin-field">
            <span>Tax treatment</span>
            <select
              className="admin-input"
              value={f.taxMode}
              onChange={(e) => update("taxMode", e.target.value as Fields["taxMode"])}
            >
              <option value="inherit">Use global rate</option>
              <option value="exempt">Tax exempt (0%)</option>
              <option value="custom">Custom rate…</option>
            </select>
          </label>
          <label className="admin-field">
            <span>Custom rate (%) — only used for “Custom”</span>
            <input
              className="admin-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 6"
              value={f.taxRatePercent}
              onChange={(e) => update("taxRatePercent", e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Inventory</legend>
        <div className="admin-grid2">
          <label className="admin-check">
            <input
              type="checkbox"
              checked={f.trackInventory}
              onChange={(e) => update("trackInventory", e.target.checked)}
            />
            <span>Track inventory (sell out at 0)</span>
          </label>
          <label className="admin-field">
            <span>Stock on hand — only used when tracking</span>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="1"
              value={f.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Customize (recipe)</legend>
        <ChipMulti
          label="Flavors (included)"
          options={pools.syrups}
          selected={f.syrupIds}
          onToggle={(id) => toggleId("syrupIds", id)}
        />
        <ChipMulti
          label="Creams & toppings (included)"
          options={pools.toppings}
          selected={f.toppingIds}
          onToggle={(id) => toggleId("toppingIds", id)}
        />
      </fieldset>
    </div>
  );
}

function ChipMulti({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Named[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="admin-field">
      <span>{label}</span>
      <div className="admin-chipwrap">
        {options.length === 0 && <span className="admin-sub">None in the pool yet.</span>}
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`admin-chip ${on ? "on" : ""}`}
              aria-pressed={on}
              onClick={() => onToggle(o.id)}
            >
              {o.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
