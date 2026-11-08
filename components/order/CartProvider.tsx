"use client";

// Client-side cart: React context backed by localStorage so a cart survives
// reloads. Keyed by Square variation id (each size is its own line). This is the
// single source of cart truth the storefront and checkout both read.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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
const EMPTY: CartItem[] = [];

// The cart lives here, read from localStorage the first time it's needed in the
// browser; every change is saved back and announced to the provider. The server
// (and the first render in the browser) sees an empty cart, so they match.
let cart: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readCart(): CartItem[] {
  if (cart === null) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Backfill lineId for carts saved before custom drinks existed.
      cart = raw ? (JSON.parse(raw) as CartItem[]).map((i) => ({ ...i, lineId: i.lineId ?? i.variationId })) : EMPTY;
    } catch {
      cart = EMPTY; // ignore malformed storage
    }
  }
  return cart;
}

function setItems(update: (prev: CartItem[]) => CartItem[]) {
  cart = update(readCart());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // storage full / unavailable — cart still works in-memory
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);

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

  const clear = useCallback(() => setItems(() => EMPTY), []);

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
