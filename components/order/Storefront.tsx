"use client";

import { useMemo, useState } from "react";
import { CartProvider } from "./CartProvider";
import ProductCard from "./ProductCard";
import CartDrawer from "./CartDrawer";
import type { Catalog, Product } from "@/lib/catalog";

export type StorefrontProps = {
  catalog: Catalog;
  ordering: boolean;
  pausedMessage?: string;
  closedNote?: string;
};

type SortKey = "featured" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "name-asc": "Name: A–Z",
  "name-desc": "Name: Z–A",
  "price-asc": "Price: Low–High",
  "price-desc": "Price: High–Low",
};

function minPrice(p: Product): number {
  return p.variations.length
    ? Math.min(...p.variations.map((v) => v.priceCents))
    : 0;
}

// Out-of-stock products always sink to the bottom, whatever the active sort.
// Array.sort is stable, so ordering within the in-stock and sold-out groups is
// preserved — this only partitions available items above unavailable ones.
function availableFirst(list: Product[]): Product[] {
  return [...list].sort((a, b) => Number(!a.available) - Number(!b.available));
}

export default function Storefront({
  catalog,
  ordering,
  pausedMessage,
  closedNote,
}: StorefrontProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const q = search.trim().toLowerCase();
  const pristine = category === "all" && q === "" && sort === "featured";

  // Filtered + sorted list used whenever the shopper engages the controls.
  const results = useMemo(() => {
    let list = catalog.products;
    if (category !== "all") list = list.filter((p) => p.categoryId === category);
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    switch (sort) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sorted.sort((a, b) => minPrice(a) - minPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => minPrice(b) - minPrice(a));
        break;
    }
    return availableFirst(sorted);
  }, [catalog.products, category, q, sort]);

  // Default browse view: products grouped into category sections.
  const byCategory = catalog.categories.map((cat) => ({
    ...cat,
    products: availableFirst(
      catalog.products.filter((p) => p.categoryId === cat.id),
    ),
  }));

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setSort("featured");
  }

  // Pill inputs get the signature neo-pop offset shadow so the controls read as
  // part of the candy UI (same treatment as the menu's tier pills).
  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-fredoka)",
    border: "2px solid var(--charcoal)",
    backgroundColor: "var(--paper)",
    color: "var(--charcoal)",
    boxShadow: "2px 2px 0 var(--charcoal)",
  };

  return (
    <CartProvider>
      {/* Paused / closed banners */}
      {!ordering && pausedMessage && (
        <div
          className="text-center px-4 py-3 text-sm font-semibold"
          style={{ backgroundColor: "var(--charcoal)", color: "var(--bone)" }}
        >
          {pausedMessage}
        </div>
      )}
      {ordering && closedNote && (
        <div
          className="text-center px-4 py-2.5 text-sm"
          style={{ backgroundColor: "var(--lemon-soft)", color: "var(--charcoal)" }}
        >
          {closedNote}
        </div>
      )}

      {/* Sticky controls: search + sort, and category filter chips */}
      <div
        className="sticky top-18 z-30"
        style={{
          backgroundColor: "rgba(246,240,222,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container mx-auto px-4 py-2.5 space-y-2.5">
          <div className="flex gap-2.5">
            {/* Search */}
            <div className="relative flex-1">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--stone)" }}
                aria-hidden
              >
                🔍
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drinks…"
                aria-label="Search drinks"
                className="w-full rounded-full pl-9 pr-4 py-2 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort drinks"
                className="appearance-none rounded-full pl-4 pr-9 py-2 text-sm font-semibold outline-none cursor-pointer w-full"
                style={inputStyle}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
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

          {/* Category filter chips */}
          <ul className="flex gap-2 overflow-x-auto no-scrollbar">
            {[{ id: "all", name: "All" }, ...catalog.categories].map((cat) => {
              const active = category === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                    style={{
                      fontFamily: "var(--font-fredoka)",
                      color: active ? "var(--magenta-deep)" : "var(--charcoal)",
                      backgroundColor: active ? "var(--pink-soft)" : "var(--paper)",
                      border: `1.5px solid ${active ? "var(--magenta)" : "var(--border)"}`,
                    }}
                  >
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-10">
        {pristine ? (
          <div className="space-y-14">
            {byCategory.map((cat) =>
              cat.products.length === 0 ? null : (
                <section key={cat.id} className="scroll-mt-40">
                  <h2 className="text-3xl md:text-4xl mb-6">{cat.name}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.products.map((p) => (
                      <ProductCard key={p.id} product={p} ordering={ordering} />
                    ))}
                  </div>
                </section>
              ),
            )}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: "var(--ash)" }}>
              No drinks match your search.
            </p>
            <button type="button" onClick={clearFilters} className="btn-outline mt-5">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm" style={{ color: "var(--stone)" }}>
              {results.length} {results.length === 1 ? "drink" : "drinks"}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} ordering={ordering} />
              ))}
            </div>
          </>
        )}
      </div>

      <CartDrawer ordering={ordering} />
    </CartProvider>
  );
}
