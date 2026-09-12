import Link from "next/link";

// Root 404 — shown for any unmatched URL and for notFound() calls. It renders
// inside the root layout, so the storefront chrome (nav/footer) frames it on
// public routes while HideOnAdmin strips it on /admin, keeping admin 404s clean.
// The "0" of 404 is a fizzing soda cup to keep it on-brand.
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div
        className="max-w-lg mx-auto text-center card-pop p-8 md:p-10"
        style={{ background: "var(--paper)" }}
      >
        {/* 4 · fizzing cup · 4 */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Four />
          <SodaCup />
          <Four />
        </div>
        <span className="sr-only">404 — page not found</span>

        <h1
          className="mt-4 text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-fredoka)", color: "var(--charcoal)" }}
        >
          This page fizzled out
        </h1>
        <p className="mt-2 text-lg" style={{ color: "var(--ash)" }}>
          We couldn&rsquo;t find that one. Let&rsquo;s get you back to the good stuff.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-pop">
            Take me home
          </Link>
          <Link href="/menu" className="btn-outline">
            See the menu
          </Link>
        </div>
      </div>
    </div>
  );
}

// The oversized magenta "4" flanking the cup.
function Four() {
  return (
    <span
      aria-hidden
      className="leading-none"
      style={{
        fontFamily: "var(--font-fredoka)",
        fontSize: "clamp(72px, 22vw, 128px)",
        fontWeight: 700,
        color: "var(--magenta)",
      }}
    >
      4
    </span>
  );
}

// Branded soda cup sized to sit between the two 4s, with fizz rising out the top.
function SodaCup() {
  return (
    <svg
      viewBox="0 0 60 96"
      aria-hidden
      style={{ width: "clamp(52px, 16vw, 92px)", height: "auto", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="nf-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--pink-soft)" />
          <stop offset="1" stopColor="var(--lemon-soft)" />
        </linearGradient>
      </defs>
      {/* fizz bubbles */}
      <circle cx="24" cy="12" r="3" fill="var(--magenta)" opacity="0.75" />
      <circle cx="36" cy="7" r="2.4" fill="var(--magenta)" opacity="0.55" />
      <circle cx="31" cy="18" r="1.8" fill="var(--magenta)" opacity="0.8" />
      {/* cup body */}
      <path
        d="M12 34 L18 90 a2 2 0 0 0 2 1.8 h20 a2 2 0 0 0 2-1.8 L50 34 Z"
        fill="url(#nf-fill)"
        stroke="var(--magenta)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* lid */}
      <rect
        x="9"
        y="28"
        width="44"
        height="8"
        rx="3"
        fill="var(--paper)"
        stroke="var(--magenta)"
        strokeWidth="3"
      />
      {/* straw */}
      <path
        d="M40 28 L46 8"
        fill="none"
        stroke="var(--magenta)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
