"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "./CartProvider";

// A single drink: photo (or branded placeholder), name, description, a size
// selector when there's more than one variation, price, and add-to-cart.
// Sold-out state is driven by the `available` flags from Square (Step 2).

function Placeholder({ name }: { name: string }) {
  // No photo yet — a soft branded tile with the drink's initial.
  return (
    <div
      className="flex items-center justify-center h-40 w-full"
      style={{
        background: "linear-gradient(135deg, var(--pink-soft), var(--lemon-soft))",
      }}
    >
      <span
        className="font-script text-5xl"
        style={{ color: "var(--magenta)", opacity: 0.55 }}
      >
        {name.charAt(0)}
      </span>
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
          // eslint-disable-next-line @next/next/no-img-element -- remote Square CDN, avoids next/image remote config
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-40 w-full object-cover"
          />
        ) : (
          <Placeholder name={product.name} />
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
                ? { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" }
                : undefined
            }
          >
            {justAdded ? "Added ✓" : soldOut ? "Sold Out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
