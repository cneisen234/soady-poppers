"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatCents } from "@/lib/money";

// Floating cart button + slide-over drawer. Checkout routes to /order/checkout,

export default function CartDrawer({ ordering }: { ordering: boolean }) {
  const { items, count, subtotalCents, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 btn-pop"
        aria-label="Open cart"
      >
        <span aria-hidden>🛒</span>
        <span>Cart</span>
        {count > 0 && (
          <span
            className="ml-1 inline-flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              minWidth: "1.4rem",
              height: "1.4rem",
              backgroundColor: "var(--bone)",
              color: "var(--magenta)",
            }}
          >
            {count}
          </span>
        )}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(43, 38, 48, 0.5)" }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "var(--cream)", borderLeft: "2px solid var(--charcoal)" }}
        aria-hidden={!open}
      >
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "2px solid var(--charcoal)" }}
        >
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-fredoka)" }}>
            Your Cart
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-2xl leading-none px-2"
            aria-label="Close cart"
            style={{ color: "var(--charcoal)" }}
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-center mt-10" style={{ color: "var(--stone)" }}>
              Your cart is empty — add a drink to get started!
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.lineId} className="flex gap-3">
                  <div className="flex-1">
                    <p
                      className="font-semibold"
                      style={{ fontFamily: "var(--font-fredoka)", color: "var(--charcoal)" }}
                    >
                      {i.productName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--stone)" }}>
                      {i.variationName} · {formatCents(i.priceCents)}
                    </p>
                    {i.customSummary && (
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--ash)" }}>
                        {i.customSummary}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div
                        className="inline-flex items-center rounded-full"
                        style={{ border: "1.5px solid var(--border)" }}
                      >
                        <button
                          type="button"
                          onClick={() => setQty(i.lineId, i.qty - 1)}
                          className="px-2.5 py-0.5 text-sm"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-2 text-sm font-semibold">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(i.lineId, i.qty + 1)}
                          className="px-2.5 py-0.5 text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i.lineId)}
                        className="text-xs underline"
                        style={{ color: "var(--stone)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span
                    className="font-semibold whitespace-nowrap"
                    style={{ fontFamily: "var(--font-fredoka)", color: "var(--charcoal)" }}
                  >
                    {formatCents(i.priceCents * i.qty)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer
            className="px-5 py-4 space-y-3"
            style={{ borderTop: "2px solid var(--charcoal)" }}
          >
            <div className="flex items-center justify-between text-lg">
              <span style={{ fontFamily: "var(--font-fredoka)" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-fredoka)", color: "var(--magenta)" }}>
                {formatCents(subtotalCents)}
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--stone)" }}>
              Taxes &amp; any shipping are calculated at checkout.
            </p>
            {ordering ? (
              <Link
                href="/order/checkout"
                className="btn-pop w-full"
                onClick={() => setOpen(false)}
              >
                Checkout
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="btn-pop w-full"
                style={{ opacity: 0.5, cursor: "not-allowed", boxShadow: "none" }}
              >
                Ordering paused
              </button>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}
