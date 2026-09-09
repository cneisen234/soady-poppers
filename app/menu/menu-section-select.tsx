"use client";

// Mobile-only replacement for the menu's category-bubble rail: a branded
// dropdown that jumps to the chosen section anchor. Desktop keeps the bubbles.
export default function MenuSectionSelect({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  return (
    <div className="sm:hidden py-3">
      <div className="relative">
        <select
          aria-label="Jump to a menu section"
          defaultValue=""
          onChange={(e) => {
            const id = e.target.value;
            if (id) window.location.hash = id;
            e.target.value = ""; // reset so the same section can be picked again
          }}
          className="appearance-none w-full rounded-full pl-4 pr-9 py-2 text-base font-semibold outline-none cursor-pointer"
          style={{
            fontFamily: "var(--font-fredoka)",
            border: "2px solid var(--charcoal)",
            backgroundColor: "var(--paper)",
            color: "var(--charcoal)",
            boxShadow: "2px 2px 0 var(--charcoal)",
          }}
        >
          <option value="" disabled>
            Jump to a section…
          </option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <svg
          width="13"
          height="13"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            stroke="var(--magenta)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
