"use client";

// Client-side cart: React context backed by localStorage so a cart survives
// reloads. Keyed by Square variation id (each size is its own line). This is the
// single source of cart truth the storefront and checkout both read.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CustomConfig } from "@/lib/custom-drink-types";

export type CartItem = {
  // Unique key per cart line. For normal items this equals variationId (so the
  // same size merges); for custom drinks it's a generated id (so two different
  // builds of the same size stay as separate lines).
  lineId: string;
  variationId: string;
  productId: string;
  productName: string;
  variationName: string;
  priceCents: number;
  imageUrl?: string;
  qty: number;
  /** Present for a custom drink: the build + a human-readable summary. */
  custom?: CustomConfig;
  customSummary?: string;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty" | "lineId"> & { lineId?: string }, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "soady-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Backfill lineId for carts saved before custom drinks existed.
        const parsed: CartItem[] = JSON.parse(raw);
        setItems(parsed.map((i) => ({ ...i, lineId: i.lineId ?? i.variationId })));
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (after initial hydration so we don't clobber it).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full / unavailable — cart still works in-memory
    }
  }, [items, hydrated]);

  const add = useCallback(
    (item: Omit<CartItem, "qty" | "lineId"> & { lineId?: string }, qty = 1) => {
      // Normal items key by variationId (so the same size merges); custom drinks
      // pass their own unique lineId so each build is its own line.
      const lineId = item.lineId ?? item.variationId;
      setItems((prev) => {
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) {
          return prev.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + qty } : i));
        }
        return [...prev, { ...item, lineId, qty }];
      });
    },
    [],
  );

  const setQty = useCallback((lineId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotalCents = items.reduce((n, i) => n + i.priceCents * i.qty, 0);
    return { items, add, setQty, remove, clear, count, subtotalCents };
  }, [items, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
