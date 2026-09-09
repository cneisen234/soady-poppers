"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "./CartProvider";

// A single drink: photo (or branded placeholder), name, description, a size
// selector when there's more than one variation, price, and add-to-cart.
// Sold-out state is driven by the `available` flags from Square.

function Placeholder() {
  // No photo yet — a soft branded tile with a soda-cup icon.
  return (
    <div
      className="flex items-center justify-center h-48 w-full"
      style={{
        background: "linear-gradient(135deg, var(--pink-soft), var(--lemon-soft))",
      }}
    >
      <svg
        width="76"
        height="76"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--magenta)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.5 }}
        aria-hidden
      >
        {/* lid */}
        <rect x="4.8" y="6" width="14.4" height="2.6" rx="1.1" />
        {/* straw */}
        <path d="M14.6 6 L16.2 2.4" />
        {/* cup */}
        <path d="M6.8 8.6 L8.6 21 h6.8 L17.2 8.6 Z" />
        {/* soda line */}
        <path d="M7.6 12.4 H16.4" />
      </svg>
    </div>
  );
}

export default function ProductCard({
  product,
  ordering,
}: {
  product: Product;
  ordering: boolean;
}) {
  const { add } = useCart();
  const sellable = product.variations.filter((v) => v.available);
  const [variationId, setVariationId] = useState(
    (sellable[0] ?? product.variations[0])?.id,
  );
  const [justAdded, setJustAdded] = useState(false);

  const selected =
    product.variations.find((v) => v.id === variationId) ?? product.variations[0];
  const soldOut = !product.available;
  const canAdd = ordering && !soldOut && selected?.available;

  function handleAdd() {
    if (!canAdd || !selected) return;
    add({
      variationId: selected.id,
      productId: product.id,
      productName: product.name,
      variationName: selected.name,
      priceCents: selected.priceCents,
      imageUrl: product.imageUrl,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div
      className="card-pop overflow-hidden flex flex-col"
      style={soldOut ? { opacity: 0.6 } : undefined}
    >
      <div className="relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote CDN, avoids next/image remote config
          <img
            src={product.imageUrl}
            alt={product.name}
            // Contain (never crop) on the same branded gradient as the placeholder,
            // so any photo — portrait or landscape — shows in full.
            className="h-48 w-full object-contain p-2"
            style={{
              background: "linear-gradient(135deg, var(--pink-soft), var(--lemon-soft))",
            }}
          />
        ) : (
          <Placeholder />
        )}
        {soldOut && (
          <span
            className="absolute top-2 right-2 badge"
            style={{ backgroundColor: "var(--charcoal)", color: "var(--bone)" }}
          >
            Sold Out
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-lg"
          style={{ fontFamily: "var(--font-fredoka)", color: "var(--charcoal)" }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-sm leading-snug" style={{ color: "var(--ash)" }}>
            {product.description}
          </p>
        )}

        {/* Size selector (only when there's a real choice) */}
        {product.variations.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variations.map((v) => {
              const active = v.id === variationId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.available}
                  onClick={() => setVariationId(v.id)}
                  className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    border: `1.5px solid ${active ? "var(--magenta)" : "var(--border)"}`,
                    backgroundColor: active ? "var(--pink-soft)" : "var(--paper)",
                    color: v.available ? "var(--charcoal)" : "var(--stone)",
                    textDecoration: v.available ? "none" : "line-through",
                    cursor: v.available ? "pointer" : "not-allowed",
                  }}
                >
                  {v.name} · {v.priceLabel}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <span
            className="price-tag"
            style={{ fontSize: "0.95rem" }}
          >
            {selected?.priceLabel}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="btn-pop text-sm"
            style={
              !canAdd
                ? {
                    // Same "locked" language as the disabled fields at checkout:
                    // muted tan fill, dashed border, muted text, no pop shadow.
                    backgroundColor: "var(--border)",
                    color: "var(--ash)",
                    border: "2px dashed var(--stone)",
                    boxShadow: "none",
                    cursor: "not-allowed",
                  }
                : undefined
            }
          >
            {justAdded ? "Added ✓" : soldOut ? "Out of stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
