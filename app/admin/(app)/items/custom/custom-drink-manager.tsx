"use client";

import { useEffect, useRef, useState } from "react";
import OptionRow from "./option-row";
import VariantRow from "./variant-row";
import {
  createBase,
  updateBase,
  deleteBase,
  createMilk,
  updateMilk,
  deleteMilk,
  createSyrup,
  updateSyrup,
  deleteSyrup,
  createTopping,
  updateTopping,
  deleteTopping,
} from "./actions";

type Variant = {
  id: string;
  name: string;
  availableRegular: boolean;
  availableSugarFree: boolean;
  active: boolean;
};
type Named = { id: string; name: string; active: boolean };

type TabKey = "bases" | "syrups" | "milks" | "toppings";
const TABS: { key: TabKey; label: string; singular: string; placeholder: string }[] = [
  { key: "bases", label: "Bases", singular: "base", placeholder: "Base (e.g. Coke)" },
  { key: "syrups", label: "Syrups", singular: "syrup", placeholder: "Flavor (e.g. Strawberry)" },
  { key: "milks", label: "Milks", singular: "milk", placeholder: "Milk (e.g. Oat milk)" },
  { key: "toppings", label: "Toppings", singular: "topping", placeholder: "Topping (e.g. Cold Foam)" },
];

export default function CustomDrinkManager({
  bases,
  syrups,
  milks,
  toppings,
}: {
  bases: Variant[];
  syrups: Variant[];
  milks: Named[];
  toppings: Named[];
}) {
  const [tab, setTab] = useState<TabKey>("bases");
  const [adding, setAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const current = TABS.find((t) => t.key === tab)!;
  // Bases and syrups carry regular/sugar-free; milks don't.
  const hasVariants = tab === "bases" || tab === "syrups";

  useEffect(() => {
    if (!adding) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAdding(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [adding]);

  async function handleAdd(fd: FormData) {
    if (tab === "bases") await createBase(fd);
    else if (tab === "syrups") await createSyrup(fd);
    else if (tab === "milks") await createMilk(fd);
    else await createTopping(fd);
    setAdding(false);
    formRef.current?.reset();
  }

  return (
    <div>
      <div className="admin-custom-head">
        <div className="admin-tabs" style={{ marginBottom: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`admin-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="admin-btn sm" onClick={() => setAdding(true)}>
          + Add {current.singular}
        </button>
      </div>

      {tab === "bases" && (
        <div>
          {bases.map((b) => (
            <VariantRow
              key={b.id}
              id={b.id}
              name={b.name}
              availableRegular={b.availableRegular}
              availableSugarFree={b.availableSugarFree}
              active={b.active}
              update={updateBase}
              remove={deleteBase}
              label="Base"
            />
          ))}
          {bases.length === 0 && <p className="admin-stub">No bases yet.</p>}
        </div>
      )}

      {tab === "syrups" && (
        <div>
          {syrups.map((s) => (
            <VariantRow
              key={s.id}
              id={s.id}
              name={s.name}
              availableRegular={s.availableRegular}
              availableSugarFree={s.availableSugarFree}
              active={s.active}
              update={updateSyrup}
              remove={deleteSyrup}
              label="Syrup"
            />
          ))}
          {syrups.length === 0 && <p className="admin-stub">No syrups yet.</p>}
        </div>
      )}

      {tab === "milks" && (
        <div>
          {milks.map((m) => (
            <OptionRow
              key={m.id}
              id={m.id}
              name={m.name}
              active={m.active}
              update={updateMilk}
              remove={deleteMilk}
              label="Milk"
            />
          ))}
          {milks.length === 0 && <p className="admin-stub">No milk options yet.</p>}
        </div>
      )}

      {tab === "toppings" && (
        <div>
          {toppings.map((t) => (
            <OptionRow
              key={t.id}
              id={t.id}
              name={t.name}
              active={t.active}
              update={updateTopping}
              remove={deleteTopping}
              label="Topping"
            />
          ))}
          {toppings.length === 0 && <p className="admin-stub">No toppings yet.</p>}
        </div>
      )}

      {adding && (
        <div className="admin-modal-backdrop" onClick={() => setAdding(false)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Add ${current.singular}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Add {current.singular}</h3>
            <form ref={formRef} action={handleAdd}>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input
                name="name"
                className="admin-input"
                placeholder={current.placeholder}
                aria-label={`${current.singular} name`}
                autoComplete="off"
                autoFocus
                required
              />
              {hasVariants && (
                <div className="admin-optlist-line" style={{ marginTop: 12 }}>
                  <label className="admin-toggle">
                    <input type="checkbox" name="regular" value="1" defaultChecked />
                    <span>Regular</span>
                  </label>
                  <label className="admin-toggle">
                    <input type="checkbox" name="sugarFree" value="1" />
                    <span>Sugar-free</span>
                  </label>
                </div>
              )}
              <label className="admin-toggle" style={{ marginTop: 12 }}>
                <input type="checkbox" name="active" value="1" defaultChecked />
                <span>Active</span>
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn ghost" onClick={() => setAdding(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn">
                  Add {current.singular}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
