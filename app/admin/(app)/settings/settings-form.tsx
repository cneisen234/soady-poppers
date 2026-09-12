"use client";

import { useRef, useState } from "react";
import type { WeekHours } from "@/lib/status";
import { updateSettings } from "./actions";
import { useAutosave, SaveStatus } from "../autosave";

type SettingsLite = {
  acceptingOrders: boolean;
  pausedMessage: string | null;
  taxRateBps: number;
  deliveryPerItemCents: number;
  deliveryFlatCents: number;
  deliveryFlatMinItems: number;
  deliveryFreeMinItems: number;
  hours: WeekHours;
};

type DayState = { open: boolean; openTime: string; closeTime: string };

type Fields = {
  acceptingOrders: boolean;
  pausedMessage: string;
  taxRatePercent: string;
  perItem: string;
  flat: string;
  flatMin: string;
  freeMin: string;
  days: Record<number, DayState>;
};

const DAY_LIST: [number, string][] = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [0, "Sunday"],
];

function timeStr(dec: number): string {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function SettingsForm({ settings }: { settings: SettingsLite }) {
  const [tab, setTab] = useState<"general" | "hours">("general");
  const [f, setF] = useState<Fields>(() => {
    const days: Record<number, DayState> = {};
    for (const [d] of DAY_LIST) {
      const h = settings.hours[d];
      days[d] = {
        open: !!h,
        openTime: timeStr(h?.open ?? 9),
        closeTime: timeStr(h?.close ?? 17),
      };
    }
    return {
      acceptingOrders: settings.acceptingOrders,
      pausedMessage: settings.pausedMessage ?? "",
      taxRatePercent: (settings.taxRateBps / 100).toString(),
      perItem: (settings.deliveryPerItemCents / 100).toFixed(2),
      flat: (settings.deliveryFlatCents / 100).toFixed(2),
      flatMin: String(settings.deliveryFlatMinItems),
      freeMin: String(settings.deliveryFreeMinItems),
      days,
    };
  });
  const latest = useRef(f);
  latest.current = f;
  const { status, schedule } = useAutosave();

  function save() {
    schedule(async () => {
      const v = latest.current;
      const fd = new FormData();
      if (v.acceptingOrders) fd.set("acceptingOrders", "on");
      fd.set("pausedMessage", v.pausedMessage);
      fd.set("taxRatePercent", v.taxRatePercent);
      fd.set("perItem", v.perItem);
      fd.set("flat", v.flat);
      fd.set("flatMin", v.flatMin);
      fd.set("freeMin", v.freeMin);
      for (const [d] of DAY_LIST) {
        const day = v.days[d];
        if (day.open) fd.set(`openDay_${d}`, "on");
        fd.set(`open_${d}`, day.openTime);
        fd.set(`close_${d}`, day.closeTime);
      }
      await updateSettings(fd);
    });
  }

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    save();
  }

  function setDay(d: number, patch: Partial<DayState>) {
    setF((prev) => ({ ...prev, days: { ...prev.days, [d]: { ...prev.days[d], ...patch } } }));
    save();
  }

  const flatMinN = Number.parseInt(f.flatMin, 10) || 0;
  const freeMinN = Number.parseInt(f.freeMin, 10) || 0;

  return (
    <div className="admin-card admin-form">
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <span className="admin-sub" style={{ margin: 0 }}>
          Changes save automatically.
        </span>
        <SaveStatus status={status} />
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === "general" ? "active" : ""}`}
          onClick={() => setTab("general")}
        >
          General
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "hours" ? "active" : ""}`}
          onClick={() => setTab("hours")}
        >
          Hours
        </button>
      </div>

      {tab === "general" && (
        <>
      <fieldset className="admin-fieldset">
        <legend>Online ordering</legend>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={f.acceptingOrders}
            onChange={(e) => set("acceptingOrders", e.target.checked)}
          />
          <span>Accepting online orders</span>
        </label>
        <label className="admin-field" style={{ marginTop: 12 }}>
          <span>Paused message — shown to customers when ordering is off</span>
          <input
            className="admin-input"
            placeholder="Online ordering is temporarily paused — check back soon!"
            value={f.pausedMessage}
            onChange={(e) => set("pausedMessage", e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Tax</legend>
        <label className="admin-field">
          <span>Global tax rate (%) — applied to non-exempt items</span>
          <input
            className="admin-input"
            style={{ maxWidth: 160 }}
            type="number"
            step="0.01"
            min="0"
            value={f.taxRatePercent}
            onChange={(e) => set("taxRatePercent", e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Delivery fee</legend>
        <div className="admin-grid2">
          <label className="admin-field">
            <span>Per item ($)</span>
            <input
              className="admin-input"
              type="number"
              step="0.01"
              min="0"
              value={f.perItem}
              onChange={(e) => set("perItem", e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Flat fee ($)</span>
            <input
              className="admin-input"
              type="number"
              step="0.01"
              min="0"
              value={f.flat}
              onChange={(e) => set("flat", e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Flat fee starts at (items)</span>
            <input
              className="admin-input"
              type="number"
              step="1"
              min="0"
              value={f.flatMin}
              onChange={(e) => set("flatMin", e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Free delivery at (items)</span>
            <input
              className="admin-input"
              type="number"
              step="1"
              min="0"
              value={f.freeMin}
              onChange={(e) => set("freeMin", e.target.value)}
            />
          </label>
        </div>
        <p className="admin-sub" style={{ margin: "12px 0 0" }}>
          Under {flatMinN} items: per-item fee. {flatMinN}–{Math.max(freeMinN - 1, flatMinN)} items:
          flat fee. {freeMinN}+ items: free.
        </p>
      </fieldset>
        </>
      )}


      {tab === "hours" && (
      <fieldset className="admin-fieldset">
        <legend>Hours</legend>
        <div className="admin-hours">
          {DAY_LIST.map(([d, label]) => {
            const day = f.days[d];
            return (
              <div key={d} className="admin-hours-row">
                <div className="admin-hours-head">
                  <span className="admin-hours-day">{label}</span>
                  <label className="admin-check inline">
                    <input
                      type="checkbox"
                      checked={day.open}
                      onChange={(e) => setDay(d, { open: e.target.checked })}
                    />
                    <span>Open</span>
                  </label>
                </div>
                <div className="admin-hours-times">
                  <input
                    type="time"
                    className="admin-input sm"
                    aria-label={`${label} open`}
                    value={day.openTime}
                    onChange={(e) => setDay(d, { openTime: e.target.value })}
                  />
                  <span className="admin-hours-dash">–</span>
                  <input
                    type="time"
                    className="admin-input sm"
                    aria-label={`${label} close`}
                    value={day.closeTime}
                    onChange={(e) => setDay(d, { closeTime: e.target.value })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
      )}
    </div>
  );
}
