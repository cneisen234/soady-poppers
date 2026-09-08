import type { Metadata } from "next";
import Link from "next/link";
import { listCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { getOpenStatus } from "@/lib/status";
import Storefront from "@/components/order/Storefront";

export const metadata: Metadata = {
  title: "Order Online — Dirty Sodas, Lemonade & More | Soady Poppers",
  description:
    "Order Soady Poppers drinks online for pickup or delivery — hand-crafted dirty sodas, fresh-squeezed lemonade, energy refreshers and more, made fresh in Fairview, MI.",
};

// Live catalog + current time drive this page, so never prerender it.
export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const settings = await getSettings();
  const open = getOpenStatus(new Date(), settings.hours);

  // Outside business hours we still take orders — just set expectations.
  const closedNote = open.open
    ? undefined
    : `We're closed right now — order anytime and we'll have it ready at the next opening. ${open.sub}.`;

  let catalog;
  try {
    catalog = await listCatalog();
  } catch {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl mb-3">Ordering is warming up</h1>
        <p style={{ color: "var(--ash)" }}>
          We couldn&apos;t load the menu just now. Please refresh in a moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden dot-texture">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--pink-soft) 0%, var(--cream) 70%)",
            opacity: 0.8,
          }}
        />
        <div className="container mx-auto px-4 relative py-12 md:py-16 text-center">
          <span className="badge mb-4">
            <span className="badge-dot" /> Pickup &amp; delivery
          </span>
          <h1 className="text-4xl md:text-6xl">
            Order{" "}
            <span className="font-script" style={{ color: "var(--magenta)" }}>
              Online
            </span>
          </h1>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "var(--ash)" }}>
            Made fresh to order. Add your favorites to the cart and check out in a
            snap.
          </p>
          <div className="mt-6">
            <Link href="/menu" className="btn-outline">
              Browse the full menu
            </Link>
          </div>
        </div>
      </section>

      <Storefront
        catalog={catalog}
        ordering={settings.acceptingOrders}
        pausedMessage={settings.pausedMessage ?? undefined}
        closedNote={closedNote}
      />
    </>
  );
}
