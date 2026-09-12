"use client";

import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { formatCents } from "@/lib/money";
import type { CustomDrinkData, CustomPrefill } from "@/lib/custom-drink-types";

type StepKey = "size" | "base" | "flavors" | "addons";
const STEP_LABEL: Record<StepKey, string> = {
  size: "Size",
  base: "Base",
  flavors: "Flavors",
  addons: "Add-ons",
};

// Build-your-own flow (and "Customize this drink" when a `prefill` is passed).
// Bottom sheet on mobile, centered dialog on desktop.
//   Build your own:  size + style → base → flavors → add-ons.
//   Customize:       the base comes from the item's category (locked, or a quick
//                    choice modal when the category allows two), so the base step
//                    drops out and the recipe's flavors + toppings start selected.
export default function CustomDrinkWizard({
  data,
  prefill,
  onClose,
}: {
  data: CustomDrinkData;
  prefill?: CustomPrefill;
  onClose: () => void;
}) {
  const { add } = useCart();
  const { sizes, bases, syrups, toppings, milks, pricing } = data;
  const customizing = !!prefill;

  // Included flavors are free: the recipe's count when customizing, else the
  // shop's global allowance. (The server re-derives this — never trusted here.)
  const freeSyrups = prefill ? prefill.syrupIds.length : pricing.freeSyrups;

  // Customize starts from the recipe; base is inherited from the category — one
  // id locks it, two-plus asks first via a modal.
  const steps: StepKey[] = customizing
    ? ["size", "flavors", "addons"]
    : ["size", "base", "flavors", "addons"];

  const [step, setStep] = useState(0);
  const [sizeId, setSizeId] = useState<string>(sizes[0]?.id ?? "");
  const [sugarFree, setSugarFree] = useState<boolean | null>(customizing ? false : null);
  const [baseId, setBaseId] = useState<string>(
    prefill && prefill.baseIds.length === 1 ? prefill.baseIds[0] : "",
  );
  const [syrupIds, setSyrupIds] = useState<string[]>(prefill?.syrupIds ?? []);
  const [toppingIds, setToppingIds] = useState<string[]>(prefill?.toppingIds ?? []);
  const [caffeine, setCaffeine] = useState(false);
  const [electrolytes, setElectrolytes] = useState(false);
  const [milkId, setMilkId] = useState<string | null>(null);

  // When customizing with two-plus category bases, the customer picks one before
  // the wizard proper.
  const needBaseChoice = customizing && !baseId;
  const choiceBases = useMemo(
    () => (prefill ? bases.filter((b) => prefill.baseIds.includes(b.id)) : []),
    [bases, prefill],
  );

  // Options available for the chosen style (regular vs sugar-free).
  const availBases = useMemo(
    () => bases.filter((b) => (sugarFree ? b.availableSugarFree : b.availableRegular)),
    [bases, sugarFree],
  );
  const availSyrups = useMemo(
    () => syrups.filter((s) => (sugarFree ? s.availableSugarFree : s.availableRegular)),
    [syrups, sugarFree],
  );

  // The locked base (customize) so we can name it and gate sugar-free.
  const lockedBase = customizing ? bases.find((b) => b.id === baseId) : undefined;

  const size = sizes.find((s) => s.id === sizeId);
  const paidSyrups = Math.max(0, syrupIds.length - freeSyrups);
  const syrupCost = paidSyrups * pricing.syrupCents;
  const addonCost =
    (caffeine ? pricing.caffeineCents : 0) +
    (electrolytes ? pricing.electrolyteCents : 0) +
    (milkId ? pricing.milkCents : 0);
  const totalCents = (size?.priceCents ?? 0) + syrupCost + addonCost;

  // A from-scratch build resets its base + flavors when the style changes
  // (availability differs); a customized item keeps its recipe.
  function chooseStyle(sf: boolean) {
    setSugarFree(sf);
    if (!customizing) {
      setBaseId("");
      setSyrupIds([]);
    }
  }

  function toggleSyrup(id: string) {
    setSyrupIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= pricing.maxSyrups) return prev; // hard cap
      return [...prev, id];
    });
  }

  function toggleTopping(id: string) {
    setToppingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canNext =
    (current === "size" && !!sizeId && sugarFree !== null) ||
    (current === "base" && !!baseId) ||
    (current === "flavors" && syrupIds.length >= 1) ||
    current === "addons";

  function handleAdd() {
    if (!size || !baseId || syrupIds.length < 1) return;
    const baseName = bases.find((b) => b.id === baseId)?.name ?? "";
    const syrupNames = syrupIds
      .map((id) => availSyrups.find((s) => s.id === id)?.name)
      .filter(Boolean);
    const toppingNames = toppingIds
      .map((id) => toppings.find((t) => t.id === id)?.name)
      .filter(Boolean);
    const milkName = milkId ? milks.find((m) => m.id === milkId)?.name : undefined;
    const parts = [
      sugarFree ? "Sugar-free" : "Regular",
      baseName,
      syrupNames.join(", "),
      toppingNames.length ? `+ ${toppingNames.join(", ")}` : "",
      caffeine ? "+ Caffeine" : "",
      electrolytes ? "+ Electrolytes" : "",
      milkName ? `+ ${milkName}` : "",
    ].filter(Boolean);

    add({
      lineId: crypto.randomUUID(),
      variationId: size.id,
      productId: "custom",
      productName: prefill ? prefill.productName : "Custom Drink",
      variationName: size.name,
      priceCents: totalCents,
      customSummary: parts.join(" · "),
      custom: {
        sizeId: size.id,
        sugarFree: !!sugarFree,
        baseId,
        syrupIds,
        toppingIds,
        caffeine,
        electrolytes,
        milkId,
        recipeProductId: prefill?.productId,
      },
    });
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Build your own drink"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(43,38,48,0.55)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          maxHeight: "92vh",
          background: "var(--cream)",
          border: "2px solid var(--charcoal)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: "2px solid var(--charcoal)", background: "var(--paper)" }}
        >
          <div>
            <h2 className="text-xl" style={{ fontFamily: "var(--font-fredoka)" }}>
              {prefill ? prefill.productName : "Build Your Own"}
            </h2>
            <p className="text-xs" style={{ color: "var(--stone)" }}>
              {needBaseChoice
                ? "Pick a base"
                : `Step ${step + 1} of ${steps.length} · ${STEP_LABEL[current]}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none px-2"
            style={{ color: "var(--charcoal)" }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {needBaseChoice ? (
            <Section label="This drink comes in two bases — pick one">
              <ChipGroup>
                {choiceBases.map((b) => (
                  <Chip key={b.id} active={false} onClick={() => setBaseId(b.id)}>
                    {b.name}
                  </Chip>
                ))}
              </ChipGroup>
            </Section>
          ) : (
            <>
              {current === "size" && (
                <div className="space-y-5">
                  <Section label="Pick a size">
                    <ChipGroup>
                      {sizes.map((s) => (
                        <Chip key={s.id} active={s.id === sizeId} onClick={() => setSizeId(s.id)}>
                          {s.name} · {formatCents(s.priceCents)}
                        </Chip>
                      ))}
                    </ChipGroup>
                  </Section>
                  <Section label="Regular or sugar-free?">
                    <ChipGroup>
                      <Chip active={sugarFree === false} onClick={() => chooseStyle(false)}>
                        Regular
                      </Chip>
                      <Chip
                        active={sugarFree === true}
                        disabled={!!lockedBase && !lockedBase.availableSugarFree}
                        onClick={() => chooseStyle(true)}
                      >
                        Sugar-free
                      </Chip>
                    </ChipGroup>
                  </Section>
                </div>
              )}

              {current === "base" && (
                <Section label="Pick your base">
                  {availBases.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--stone)" }}>
                      No {sugarFree ? "sugar-free" : "regular"} bases available.
                    </p>
                  ) : (
                    <ChipGroup>
                      {availBases.map((b) => (
                        <Chip key={b.id} active={b.id === baseId} onClick={() => setBaseId(b.id)}>
                          {b.name}
                        </Chip>
                      ))}
                    </ChipGroup>
                  )}
                </Section>
              )}

              {current === "flavors" && (
                <Section
                  label="Pick your flavors"
                  hint={`${freeSyrups} free, then ${formatCents(pricing.syrupCents)} each · max ${pricing.maxSyrups}`}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--ash)" }}>
                    {syrupIds.length} selected{paidSyrups > 0 ? ` · +${formatCents(syrupCost)}` : ""}
                  </p>
                  <ChipGroup>
                    {availSyrups.map((s) => {
                      const active = syrupIds.includes(s.id);
                      const atMax = !active && syrupIds.length >= pricing.maxSyrups;
                      return (
                        <Chip key={s.id} active={active} disabled={atMax} onClick={() => toggleSyrup(s.id)}>
                          {s.name}
                        </Chip>
                      );
                    })}
                  </ChipGroup>
                </Section>
              )}

              {current === "addons" && (
                <div className="space-y-5">
                  {toppings.length > 0 && (
                    <Section label="Creams & toppings (free)">
                      <ChipGroup>
                        {toppings.map((t) => (
                          <Chip
                            key={t.id}
                            active={toppingIds.includes(t.id)}
                            onClick={() => toggleTopping(t.id)}
                          >
                            {t.name}
                          </Chip>
                        ))}
                      </ChipGroup>
                    </Section>
                  )}
                  <Section label="Add-ons">
                    <div className="space-y-2">
                      <ToggleRow
                        label={`Caffeine (+${formatCents(pricing.caffeineCents)})`}
                        checked={caffeine}
                        onChange={setCaffeine}
                      />
                      <ToggleRow
                        label={`Electrolytes (+${formatCents(pricing.electrolyteCents)})`}
                        checked={electrolytes}
                        onChange={setElectrolytes}
                      />
                    </div>
                  </Section>
                  {milks.length > 0 && (
                    <Section label={`Milk alternative (+${formatCents(pricing.milkCents)})`}>
                      <ChipGroup>
                        <Chip active={milkId === null} onClick={() => setMilkId(null)}>
                          None
                        </Chip>
                        {milks.map((m) => (
                          <Chip key={m.id} active={milkId === m.id} onClick={() => setMilkId(m.id)}>
                            {m.name}
                          </Chip>
                        ))}
                      </ChipGroup>
                    </Section>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3.5 flex items-center gap-3"
          hidden={needBaseChoice}
          style={{ borderTop: "2px solid var(--charcoal)", background: "var(--paper)" }}
        >
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-outline text-sm"
            >
              Back
            </button>
          )}
          <span className="ml-auto text-lg" style={{ fontFamily: "var(--font-fredoka)", color: "var(--magenta)" }}>
            {formatCents(totalCents)}
          </span>
          {!isLast ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="btn-pop text-sm"
              style={!canNext ? { opacity: 0.5, boxShadow: "none", cursor: "not-allowed" } : undefined}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={syrupIds.length < 1}
              className="btn-pop text-sm"
              style={syrupIds.length < 1 ? { opacity: 0.5, boxShadow: "none", cursor: "not-allowed" } : undefined}
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-base" style={{ fontFamily: "var(--font-fredoka)", color: "var(--charcoal)" }}>
          {label}
        </h3>
        {hint && (
          <span className="text-xs text-right" style={{ color: "var(--stone)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
      style={{
        fontFamily: "var(--font-fredoka)",
        border: `2px solid ${active ? "var(--magenta)" : "var(--border)"}`,
        backgroundColor: active ? "var(--pink-soft)" : "var(--paper)",
        color: disabled ? "var(--stone)" : active ? "var(--magenta-deep)" : "var(--charcoal)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 cursor-pointer"
      style={{ border: "2px solid var(--border)", background: "var(--paper)" }}
    >
      <span className="text-sm font-semibold" style={{ color: "var(--charcoal)" }}>
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 20, height: 20, accentColor: "var(--magenta)" }}
      />
    </label>
  );
}
