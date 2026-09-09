"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

  // When the shopper searches / filters / sorts, the results list changes height
  // and the page can leave them stranded near the (now higher) footer. Jump back
  // to the top so they see results from the start. Skip the initial mount.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [search, category, sort]);

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

  // Shared dropdown chevron (positioned inside a `relative` wrapper).
  const chevron = (
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
  );

  // Store paused — replace the whole storefront with a branded notice.
  if (!ordering) {
    const message =
      pausedMessage || "Online ordering is temporarily unavailable, check back soon!";
    return (
      <div className="container mx-auto px-4 py-20">
        <div
          className="max-w-lg mx-auto text-center card-pop p-8 md:p-10"
          style={{ background: "var(--paper)" }}
        >
          <div className="text-5xl mb-2" aria-hidden>
            🥤
          </div>
          <h2 className="text-2xl md:text-3xl mb-3">Ordering is paused</h2>
          <p className="text-lg" style={{ color: "var(--ash)" }}>
            {message}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/menu" className="btn-outline">
              Browse the menu
            </Link>
            <Link href="/visit" className="btn-pop">
              Hours &amp; directions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      {/* Closed-but-still-taking-orders note */}
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
          {/* Row 1: search (full width on mobile; shares the row with Sort on desktop) */}
          <div className="flex gap-2.5">
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
                // text-base (16px) on mobile stops iOS from zooming in on focus.
                className="no-native-clear w-full rounded-full pl-9 pr-10 py-2 text-base sm:text-sm outline-none"
                style={inputStyle}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center rounded-full w-6 h-6 text-sm leading-none"
                  style={{ color: "var(--charcoal)", backgroundColor: "var(--border)" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort — desktop position (row 1, right) */}
            <div className="relative hidden sm:block">
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
              {chevron}
            </div>
          </div>

          {/* Row 2 (desktop): category filter chips */}
          <ul className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar">
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

          {/* Row 2 (mobile): category dropdown (left) + sort dropdown (right) */}
          <div className="flex gap-2.5 sm:hidden">
            <div className="relative flex-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="appearance-none rounded-full pl-4 pr-9 py-2 text-base font-semibold outline-none cursor-pointer w-full"
                style={inputStyle}
              >
                <option value="all">All categories</option>
                {catalog.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {chevron}
            </div>
            <div className="relative flex-1">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort drinks"
                className="appearance-none rounded-full pl-4 pr-9 py-2 text-base font-semibold outline-none cursor-pointer w-full"
                style={inputStyle}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
              {chevron}
            </div>
          </div>
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
