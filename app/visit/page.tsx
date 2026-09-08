import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { shop } from '@/lib/shop';
import { getSettings } from '@/lib/settings';
import { formatHours } from '@/lib/status';
import OpenStatus from '@/components/OpenStatus';

export const metadata: Metadata = {
  title: 'Visit & Hours — Soady Poppers Soda Pop Shop | Fairview, MI',
  description:
    "Find Soady Poppers in Fairview, Michigan. Hours, directions, and where to grab dirty sodas, fresh lemonade and kettle corn — all made fresh at the counter.",
};

export default async function VisitPage() {
  const { hours } = await getSettings();
  const hoursDisplay = formatHours(hours);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden dot-texture">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--teal-soft) 0%, var(--cream) 68%)', opacity: 0.75 }} />
        <div className="container mx-auto px-4 relative py-14 md:py-20 text-center">
          <span className="badge badge-teal mb-4"><span className="badge-dot" /> {shop.town_short}</span>
          <h1 className="text-4xl md:text-6xl">
            Come <span className="font-script" style={{ color: 'var(--magenta)' }}>Visit</span>
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <OpenStatus className="text-sm" hours={hours} />
          </div>
        </div>
      </section>

      {/* Hours + contact — two equal-height cards */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Hours */}
            <div className="card-pop p-7 h-full flex flex-col">
              <span className="eyebrow">Open hours</span>
              <h2 className="text-2xl md:text-3xl mt-2 mb-5">Hours</h2>
              <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {hoursDisplay.map((h) => (
                  <li key={h.label} className="flex items-center justify-between py-2.5">
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--charcoal)' }}>{h.label}</span>
                    <span className="font-semibold" style={{ color: h.closed ? 'var(--pink-deep)' : 'var(--teal-deep)' }}>{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column: contact card, then the map beneath it */}
            <div className="flex flex-col gap-6 h-full">
              <div className="card-pop card-pop-teal p-7">
                <span className="eyebrow">Find us & say hi</span>
                <h2 className="text-2xl md:text-3xl mt-2 mb-5">Get in touch</h2>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--stone)' }}>Find us</p>
                    <p className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--magenta)' }}>{shop.address}</p>
                    <p className="font-semibold" style={{ color: 'var(--charcoal)' }}>{shop.cityStateZip}</p>
                  </div>
                </div>
                <div className="pt-6 flex flex-wrap gap-3">
                  <a href={shop.mapsHref} target="_blank" rel="noopener noreferrer" className="btn-pop">Get Directions</a>
                  <a
                    href={shop.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
                    </svg>
                    Facebook
                  </a>
                </div>
              </div>

              {/* Map fills the rest of the column so it lines up with the Hours card */}
              <div
                className="relative flex-1 min-h-[300px] rounded-[1.5rem] overflow-hidden border-2 border-[var(--charcoal)]"
                style={{ boxShadow: '6px 6px 0 rgba(62,154,166,0.5)' }}
              >
                <iframe
                  src={shop.mapsEmbed}
                  title={`Map to ${shop.name} at ${shop.address}, ${shop.cityStateZip}`}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href={shop.mapsHref} target="_blank" rel="noopener noreferrer" className="btn-teal">Open in Google Maps</a>
          </div>
        </div>
      </section>

      {/* Peek inside */}
      <section className="section-padding pb-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 flex flex-col items-center">
            <span className="eyebrow">A peek inside</span>
            <h2 className="text-2xl md:text-3xl mt-2">Come see us</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { src: '/pre-made-cups.webp', alt: 'Grab-and-go cups lined up at Soady Poppers' },
              { src: '/popcorn.webp', alt: "Fresh kettle corn in the popper" },
              { src: '/owners.webp', alt: 'The Soady Poppers family' },
            ].map((p, i) => (
              <div
                key={p.src}
                className="relative aspect-[4/3] rounded-[1.25rem] overflow-hidden border-2 border-[var(--charcoal)]"
                style={{ boxShadow: i % 2 ? '5px 5px 0 rgba(62,154,166,0.5)' : '5px 5px 0 rgba(240,121,159,0.55)' }}
              >
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding pt-6">
        <div className="container mx-auto px-4">
          <div className="rounded-[1.5rem] p-8 md:p-12 text-center" style={{ background: 'linear-gradient(120deg, var(--pink-soft), var(--lemon-soft))', border: '2px solid var(--charcoal)', boxShadow: '8px 8px 0 var(--charcoal)' }}>
            <h2 className="text-3xl md:text-4xl">
              See you at the <span className="font-script" style={{ color: 'var(--magenta)' }}>shop</span>
            </h2>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/menu" className="btn-pop">Browse the Menu</Link>
              <a href={shop.mapsHref} target="_blank" rel="noopener noreferrer" className="btn-outline">Get Directions</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
