"use client";

import { useRef, useState } from "react";
import { updateCustomPricing } from "./pricing-actions";
import { useAutosave, SaveStatus } from "../../autosave";

export type CustomPricing = {
  addonSyrupCents: number;
  customFreeSyrups: number;
  customMaxSyrups: number;
  addonCaffeineCents: number;
  addonElectrolyteCents: number;
  addonMilkCents: number;
};

type Fields = {
  syrupPrice: string;
  freeSyrups: string;
  maxSyrups: string;
  caffeinePrice: string;
  electrolytePrice: string;
  milkPrice: string;
};

export default function CustomPricingForm({ pricing }: { pricing: CustomPricing }) {
  const [f, setF] = useState<Fields>({
    syrupPrice: (pricing.addonSyrupCents / 100).toFixed(2),
    freeSyrups: String(pricing.customFreeSyrups),
    maxSyrups: String(pricing.customMaxSyrups),
    caffeinePrice: (pricing.addonCaffeineCents / 100).toFixed(2),
    electrolytePrice: (pricing.addonElectrolyteCents / 100).toFixed(2),
    milkPrice: (pricing.addonMilkCents / 100).toFixed(2),
  });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    schedule(async () => {
      const v = latest.current;
      const fd = new FormData();
      fd.set("syrupPrice", v.syrupPrice);
      fd.set("freeSyrups", v.freeSyrups);
      fd.set("maxSyrups", v.maxSyrups);
      fd.set("caffeinePrice", v.caffeinePrice);
      fd.set("electrolytePrice", v.electrolytePrice);
      fd.set("milkPrice", v.milkPrice);
      await updateCustomPricing(fd);
    });
  }

  return (
    <fieldset className="admin-fieldset">
      <legend>Pricing &amp; add-ons</legend>
      <div className="admin-grid2">
        <label className="admin-field">
          <span>Extra syrup ($ each)</span>
          <input className="admin-input" type="number" step="0.01" min="0" value={f.syrupPrice} onChange={(e) => set("syrupPrice", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Free syrups included</span>
          <input className="admin-input" type="number" step="1" min="0" value={f.freeSyrups} onChange={(e) => set("freeSyrups", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Max syrups</span>
          <input className="admin-input" type="number" step="1" min="1" value={f.maxSyrups} onChange={(e) => set("maxSyrups", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Caffeine ($)</span>
          <input className="admin-input" type="number" step="0.01" min="0" value={f.caffeinePrice} onChange={(e) => set("caffeinePrice", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Electrolytes ($)</span>
          <input className="admin-input" type="number" step="0.01" min="0" value={f.electrolytePrice} onChange={(e) => set("electrolytePrice", e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Milk alternative ($)</span>
          <input className="admin-input" type="number" step="0.01" min="0" value={f.milkPrice} onChange={(e) => set("milkPrice", e.target.value)} />
        </label>
      </div>
      <div style={{ marginTop: 10 }}>
        <SaveStatus status={status} />
      </div>
    </fieldset>
  );
}
