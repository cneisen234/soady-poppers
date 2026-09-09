"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatCents } from "@/lib/money";
import { availableMethods, type FulfillmentMethod } from "@/lib/fulfillment";

// Square Web Payments SDK — loaded from their CDN, tokenizes the card inside a
// Square-hosted iframe so raw card data never touches our server.
type TokenizeResult = { status: string; token?: string; errors?: { message: string }[] };
type SquareCard = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<TokenizeResult>;
};
type SquarePayments = { card: () => Promise<SquareCard> };
type SquareSdk = { payments: (appId: string, locationId: string) => SquarePayments };
declare global {
  interface Window {
    Square?: SquareSdk;
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SDK_URL = {
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
};

// reCAPTCHA v3 — the script is loaded site-wide in the root layout; here we just
// request a token for the "checkout" action. Resolves undefined if unavailable
// (the server treats a missing token as a failed check when reCAPTCHA is on).
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
function getRecaptchaToken(): Promise<string | undefined> {
  return new Promise((resolve) => {
    const g = window.grecaptcha;
    if (!g || !RECAPTCHA_SITE_KEY) return resolve(undefined);
    g.ready(() =>
      g
        .execute(RECAPTCHA_SITE_KEY, { action: "checkout" })
        .then(resolve)
        .catch(() => resolve(undefined)),
    );
  });
}

const METHOD_LABEL: Record<FulfillmentMethod, string> = {
  pickup: "Pickup",
  delivery: "Local delivery",
  shipping: "Shipping",
};

// All 50 states — value is the 2-letter code Square expects, label is the name.
const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

// Magenta chevron overlaid on the right of a native <select>.
function SelectChevron() {
  return (
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
}

// A muted padlock overlaid where the chevron would be, to signal a locked
// (disabled) select — matches the disabledFieldStyle treatment.
function LockGlyph() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
    >
      <rect
        x="2.5"
        y="6"
        width="9"
        height="6.5"
        rx="1.3"
        stroke="var(--stone)"
        strokeWidth="1.4"
      />
      <path
        d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6"
        stroke="var(--stone)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Totals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
  // Coupon echo from the quote: the applied code (null if none/vendor rate), and
  // whether an entered code was recognized (null when none was entered).
  appliedCouponCode?: string | null;
  couponValid?: boolean | null;
};

// Delivery is limited to these towns — city and ZIP are constrained to match.
const DELIVERY_CITIES = ["Fairview", "Mio"];
const DELIVERY_ZIPS = ["48647", "48621"];
const DELIVERY_STATE = "MI"; // Michigan-only delivery area.

type Address = { line1: string; line2: string; city: string; state: string; zip: string };
const EMPTY_ADDRESS: Address = {
  line1: "",
  line2: "",
  city: "",
  state: DELIVERY_STATE,
  zip: "",
};

export default function CheckoutForm({
  appId,
  locationId,
  squareEnv,
}: {
  appId: string;
  locationId: string;
  squareEnv: string;
}) {
  const { items, subtotalCents, clear, remove } = useCart();
  const lines = useMemo(
    () => items.map((i) => ({ variationId: i.variationId, qty: i.qty })),
    [items],
  );
  const methods = availableMethods();

  const cardRef = useRef<SquareCard | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{
    orderId: string;
    totalCents: number;
    method: FulfillmentMethod;
  } | null>(null);

  const [method, setMethod] = useState<FulfillmentMethod>("pickup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [addr, setAddr] = useState<Address>(EMPTY_ADDRESS);
  // Variation ids that sold out at checkout — drives the sold-out modal.
  const [soldOut, setSoldOut] = useState<string[] | null>(null);
  // Set when ordering was paused at checkout — drives the paused modal.
  const [paused, setPaused] = useState<string | null>(null);

  // Load the Square SDK and mount the card field once.
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;

    async function init() {
      const url = SDK_URL[squareEnv === "production" ? "production" : "sandbox"];
      if (!window.Square) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = url;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load payment form."));
          document.head.appendChild(s);
        });
      }
      if (cancelled || !window.Square) return;
      try {
        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card();
        await card.attach("#card-container");
        if (cancelled) return;
        cardRef.current = card;
        setCardReady(true);
      } catch {
        setError("Couldn't load the payment form. Please refresh.");
      }
    }
    init().catch(() => setError("Couldn't load the payment form. Please refresh."));

    return () => {
      cancelled = true;
    };
  }, [appId, locationId, squareEnv, items.length]);

  // Live subtotal/discount/tax/fee/total — re-quotes when the cart, method,
  // email, or coupon changes (email drives any vendor discount; the coupon its
  // own). Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    if (lines.length === 0) {
      setTotals(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch("/api/order/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          method,
          email: email.trim() || undefined,
          couponCode: coupon.trim() || undefined,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && d.ok) setTotals(d);
        })
        .catch(() => {});
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines, method, email, coupon]);

  useEffect(() => {
    if (placed) window.scrollTo({ top: 0, behavior: "auto" });
  }, [placed]);

  async function handlePay() {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email so we can send order updates.");
      return;
    }
    if (method === "delivery" && (!addr.line1.trim() || !addr.city.trim() || !addr.state.trim() || !addr.zip.trim())) {
      setError("Please enter your full delivery address.");
      return;
    }
    if (!cardRef.current) {
      setError("Payment form isn't ready yet.");
      return;
    }
    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken();
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setError(result.errors?.[0]?.message ?? "Please check your card details.");
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer: { name, email, phone, note },
          sourceId: result.token,
          fulfillment: {
            method,
            address: method === "delivery" ? addr : undefined,
          },
          couponCode: coupon.trim() || undefined,
          recaptchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        // Ordering was paused — nothing was charged. Show the modal (cart clears on dismiss).
        if (res.status === 409 && data.paused) {
          setPaused(data.message || "Online ordering is temporarily unavailable, check back soon!");
          setSubmitting(false);
          return;
        }
        // Sold out between cart and charge — nothing was charged. Show the modal.
        if (res.status === 409 && Array.isArray(data.soldOut) && data.soldOut.length > 0) {
          setSoldOut(data.soldOut as string[]);
          setSubmitting(false);
          return;
        }
        setError(data.message ?? "Payment could not be processed.");
        setSubmitting(false);
        return;
      }
      setPlaced({ orderId: data.orderId, totalCents: data.totalCents, method: data.method });
      clear();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    border: "2px solid var(--charcoal)",
    backgroundColor: "var(--paper)",
    color: "var(--charcoal)",
    boxShadow: "2px 2px 0 var(--charcoal)",
  };

  // Shared "locked" look, brand-consistent: drop the pop shadow (that's what
  // reads as pressable), mute the fill to the warm tan, dash the border, and use
  // muted text — so it's unmistakably disabled. Same language as the out-of-stock
  // button in ProductCard.
  const disabledFieldStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    border: "2px dashed var(--stone)",
    backgroundColor: "var(--border)",
    color: "var(--ash)",
    boxShadow: "none",
    cursor: "not-allowed",
  };

  // --- Confirmation ---
  if (placed) {
    const deliver = placed.method === "delivery";
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <span className="badge mb-4">
          <span className="badge-dot" /> Order confirmed
        </span>
        <h1 className="text-3xl md:text-4xl mb-3">Thanks, {name || "friend"}! 🎉</h1>
        <p style={{ color: "var(--ash)" }}>
          Your order is in.{" "}
          {deliver
            ? "We'll get it ready and out for local delivery, and send a confirmation shortly."
            : "We'll have it ready for pickup and send a confirmation shortly."}
        </p>
        <div
          className="mt-6 inline-block rounded-2xl px-6 py-4"
          style={{ backgroundColor: "var(--paper)", border: "2px solid var(--charcoal)" }}
        >
          <p className="text-sm" style={{ color: "var(--stone)" }}>
            {deliver ? "Local delivery" : "Pickup"} · Order #
            {placed.orderId.slice(-8).toUpperCase()}
          </p>
          <p className="text-2xl mt-1" style={{ fontFamily: "var(--font-fredoka)" }}>
            {formatCents(placed.totalCents)}
          </p>
        </div>
        <div className="mt-8">
          <Link href="/order" className="btn-pop">
            Order more
          </Link>
        </div>
      </div>
    );
  }

  // --- Empty cart ---
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl mb-3">Your cart is empty</h1>
        <p className="mb-6" style={{ color: "var(--ash)" }}>
          Add a drink and come back to check out.
        </p>
        <Link href="/order" className="btn-pop">
          Browse drinks
        </Link>
      </div>
    );
  }

  const soldOutItems = soldOut
    ? items.filter((i) => soldOut.includes(i.variationId))
    : [];
  function dismissSoldOut() {
    soldOut?.forEach((id) => remove(id));
    setSoldOut(null);
  }
  function dismissPaused() {
    clear();
    window.location.href = "/order";
  }

  return (
    <div className="container mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10 max-w-5xl">
      {/* Paused modal — nothing was charged; dismissing clears the cart. */}
      {paused && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ordering paused"
          onClick={dismissPaused}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(43,38,48,0.55)",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-pop"
            style={{ maxWidth: 440, width: "100%", padding: "24px", background: "var(--paper)" }}
          >
            <h3 className="text-2xl mb-2">Ordering is paused</h3>
            <p style={{ color: "var(--ash)", marginBottom: 20 }}>{paused}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn-pop" onClick={dismissPaused}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sold-out modal — nothing was charged; dismissing removes the items. */}
      {soldOut && soldOutItems.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Item sold out"
          onClick={dismissSoldOut}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(43,38,48,0.55)",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-pop"
            style={{ maxWidth: 440, width: "100%", padding: "24px", background: "var(--paper)" }}
          >
            <h3 className="text-2xl mb-2">Just sold out</h3>
            <p style={{ color: "var(--ash)", marginBottom: 12 }}>
              Sorry — {soldOutItems.length === 1 ? "this drink" : "these drinks"} sold out
              before your order went through, so you weren’t charged.{" "}
              {soldOutItems.length === 1 ? "It’s" : "They’re"} been removed from your cart:
            </p>
            <ul style={{ margin: "0 0 20px", paddingLeft: 18 }}>
              {soldOutItems.map((i) => (
                <li key={i.variationId} style={{ fontWeight: 600, color: "var(--charcoal)" }}>
                  {i.productName} · {i.variationName}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn-pop" onClick={dismissSoldOut}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left: fulfillment + customer + payment */}
      <div>
        <h1 className="text-3xl md:text-4xl mb-6">Checkout</h1>

        {/* Fulfillment method selector */}
        {methods.length > 1 && (
          <div className="flex gap-2 mb-6">
            {methods.map((m) => {
              const active = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    border: `2px solid var(--charcoal)`,
                    backgroundColor: active ? "var(--pink-soft)" : "var(--paper)",
                    color: active ? "var(--magenta-deep)" : "var(--charcoal)",
                    boxShadow: active ? "2px 2px 0 var(--charcoal)" : "none",
                  }}
                >
                  {METHOD_LABEL[m]}
                </button>
              );
            })}
          </div>
        )}

        <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-fredoka)" }}>
          {method === "delivery" ? "Delivery details" : "Pickup details"}
        </h2>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name *"
            aria-label="Full name"
            className="w-full rounded-xl px-4 py-2.5 outline-none"
            style={inputStyle}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email (for receipt & order updates) *"
            aria-label="Email"
            className="w-full rounded-xl px-4 py-2.5 outline-none"
            style={inputStyle}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder={method === "delivery" ? "Phone *" : "Phone"}
            aria-label="Phone"
            className="w-full rounded-xl px-4 py-2.5 outline-none"
            style={inputStyle}
          />

          {/* Delivery address */}
          {method === "delivery" && (
            <>
              <input
                value={addr.line1}
                onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                placeholder="Street address *"
                aria-label="Street address"
                className="w-full rounded-xl px-4 py-2.5 outline-none"
                style={inputStyle}
              />
              <input
                value={addr.line2}
                onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
                placeholder="Apt / unit (optional)"
                aria-label="Apartment or unit"
                className="w-full rounded-xl px-4 py-2.5 outline-none"
                style={inputStyle}
              />
              <div className="relative">
                <select
                  value={addr.city}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  aria-label="City"
                  className="appearance-none w-full rounded-xl pl-4 pr-9 py-2.5 outline-none cursor-pointer"
                  style={{ ...inputStyle, color: addr.city ? "var(--charcoal)" : "var(--stone)" }}
                >
                  <option value="">City *</option>
                  {DELIVERY_CITIES.map((c) => (
                    <option key={c} value={c} style={{ color: "var(--charcoal)" }}>
                      {c}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={addr.state}
                    disabled
                    aria-label="State (delivery is Michigan only)"
                    title="Delivery is available in Michigan only"
                    className="appearance-none w-full rounded-xl pl-4 pr-9 py-2.5 outline-none cursor-not-allowed"
                    style={disabledFieldStyle}
                  >
                    {US_STATES.filter((s) => s.code === DELIVERY_STATE).map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <LockGlyph />
                </div>
                <div className="relative w-36">
                  <select
                    value={addr.zip}
                    onChange={(e) => setAddr({ ...addr, zip: e.target.value })}
                    aria-label="ZIP code"
                    className="appearance-none w-full rounded-xl pl-4 pr-9 py-2.5 outline-none cursor-pointer"
                    style={{ ...inputStyle, color: addr.zip ? "var(--charcoal)" : "var(--stone)" }}
                  >
                    <option value="">ZIP *</option>
                    {DELIVERY_ZIPS.map((z) => (
                      <option key={z} value={z} style={{ color: "var(--charcoal)" }}>
                        {z}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>
            </>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Order notes (optional)"
            aria-label="Order notes"
            rows={2}
            className="w-full rounded-xl px-4 py-2.5 outline-none resize-none"
            style={inputStyle}
          />
        </div>

        <h2 className="text-xl mt-7 mb-3" style={{ fontFamily: "var(--font-fredoka)" }}>
          Payment
        </h2>
        <div
          id="card-container"
          className="rounded-xl px-3 py-2 min-h-14"
          style={{ border: "2px solid var(--charcoal)", backgroundColor: "var(--paper)" }}
        />
        {!cardReady && !error && (
          <p className="mt-2 text-sm" style={{ color: "var(--stone)" }}>
            Loading secure payment form…
          </p>
        )}
      </div>

      {/* Right: order summary */}
      <div>
        <div className="card-pop p-6 lg:sticky lg:top-24">
          <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-fredoka)" }}>
            Order summary
          </h2>
          <ul className="space-y-2.5 mb-4">
            {items.map((i) => (
              <li key={i.variationId} className="flex justify-between gap-3 text-sm">
                <span style={{ color: "var(--charcoal)" }}>
                  {i.qty} × {i.productName}
                  <span style={{ color: "var(--stone)" }}> ({i.variationName})</span>
                </span>
                <span className="whitespace-nowrap font-semibold">
                  {formatCents(i.priceCents * i.qty)}
                </span>
              </li>
            ))}
          </ul>

          {/* Coupon code */}
          <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <label
              htmlFor="coupon"
              className="block text-sm mb-1.5"
              style={{ color: "var(--ash)", fontFamily: "var(--font-fredoka)" }}
            >
              Have a coupon code?
            </label>
            <input
              id="coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Enter code"
              aria-label="Coupon code"
              autoCapitalize="characters"
              autoComplete="off"
              className="w-full rounded-xl px-4 py-2.5 outline-none uppercase"
              style={inputStyle}
            />
            {coupon.trim() && totals?.appliedCouponCode && (
              <p className="mt-1.5 text-sm" style={{ color: "var(--teal-deep)" }}>
                Code {totals.appliedCouponCode} applied 🎉
              </p>
            )}
            {coupon.trim() && totals?.couponValid === false && (
              <p className="mt-1.5 text-sm" style={{ color: "var(--magenta-deep)" }}>
                That code isn’t valid.
              </p>
            )}
          </div>

          <div className="space-y-1.5 pt-4 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
            <Row label="Subtotal" value={formatCents(totals?.subtotalCents ?? subtotalCents)} />
            {totals && totals.discountCents > 0 && (
              <Row
                label={
                  totals.appliedCouponCode
                    ? `Coupon (${totals.appliedCouponCode})`
                    : "Vendor discount"
                }
                value={`-${formatCents(totals.discountCents)}`}
              />
            )}
            {method === "delivery" && (
              <Row label="Local delivery" value={totals ? formatCents(totals.feeCents) : "—"} />
            )}
            <Row label="Tax" value={totals ? formatCents(totals.taxCents) : "—"} muted />
            <div
              className="flex justify-between text-lg pt-2 mt-1"
              style={{ borderTop: "1px solid var(--border)", fontFamily: "var(--font-fredoka)" }}
            >
              <span>Total</span>
              <span style={{ color: "var(--magenta)" }}>
                {totals ? formatCents(totals.totalCents) : formatCents(subtotalCents)}
              </span>
            </div>
          </div>

          {error && (
            <p
              className="mt-4 text-sm rounded-lg px-3 py-2"
              style={{ backgroundColor: "var(--pink-soft)", color: "var(--magenta-deep)" }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={submitting || !cardReady}
            className="btn-pop w-full mt-5"
            style={
              submitting || !cardReady
                ? { opacity: 0.6, cursor: "not-allowed", boxShadow: "none" }
                : undefined
            }
          >
            {submitting
              ? "Placing order…"
              : `Pay ${formatCents(totals?.totalCents ?? subtotalCents)}`}
          </button>
          <p className="mt-3 text-xs text-center" style={{ color: "var(--stone)" }}>
            {method === "delivery" ? "Local delivery" : "Pickup at the shop"} · secure
            payment by Square
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: muted ? "var(--stone)" : "var(--ash)" }}>{label}</span>
      <span style={{ color: "var(--charcoal)" }}>{value}</span>
    </div>
  );
}
