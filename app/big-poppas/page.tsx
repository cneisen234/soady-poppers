import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { shop, bigPoppa } from '@/lib/shop';
import {
  Drips,
  Splat,
  SprayArrow,
  Star,
  Cassette,
  Crown,
  TapedPhoto,
} from './graffiti';

export const metadata: Metadata = {
  title: "Big Poppa's Kettle Corn — Small Batch, Big Flavor | Soady Poppers, Fairview MI",
  description:
    "Big Poppa's Kettle Corn — Soady Poppers' popcorn sub-brand. Small-batch, hand-bagged kettle corn with an attitude: Original Kettle, Caramel Apple, Choco Cherry, Big Apple and the premium Elite Eats collection. Popped fresh in Fairview, Michigan.",
};

// Neon token per flavor color — drives fill, block-shadow + glow so each flavor
// card gets its own tag color.
const NEON: Record<string, { fill: string; shadow: string; glow: string }> = {
  cyan: { fill: 'var(--bp-cyan)', shadow: 'var(--bp-pink)', glow: 'rgba(47,227,240,0.55)' },
  lime: { fill: 'var(--bp-lime)', shadow: 'var(--bp-purple)', glow: 'rgba(180,245,42,0.5)' },
  pink: { fill: 'var(--bp-pink)', shadow: 'var(--bp-cyan)', glow: 'rgba(255,47,146,0.6)' },
  purple: { fill: 'var(--bp-purple)', shadow: 'var(--bp-lime)', glow: 'rgba(123,47,247,0.6)' },
};

export default function BigPoppasPage() {
  return (
    <div className="bp-scope">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bp-brick">
        <div className="absolute inset-0 bp-spray opacity-90" />
        {/* neon spotlights bleeding through the wall */}
        <div className="bp-glow absolute -top-24 -left-24 w-[420px] h-[420px]" style={{ background: 'var(--bp-pink)' }} />
        <div className="bp-glow absolute top-1/3 -right-28 w-[460px] h-[460px]" style={{ background: 'var(--bp-cyan)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,12,0.35) 0%, rgba(10,10,12,0.9) 100%)' }} />

        {/* thrown splatter — flung across the wall in the brand's neon colors */}
        <Splat className="absolute top-[12%] right-[7%] w-40 opacity-80 rotate-12" color="var(--bp-pink)" />
        <Splat className="absolute bottom-[14%] left-[4%] w-28 opacity-70 -rotate-12" color="var(--bp-cyan)" />
        <Splat className="absolute top-[30%] left-[9%] w-24 opacity-70 rotate-[200deg]" color="var(--bp-lime)" />
        <Splat className="absolute bottom-[24%] right-[12%] w-32 opacity-70 -rotate-45" color="var(--bp-yellow)" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center py-20 md:py-28">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bp-chip hover:opacity-80 transition-opacity"
                style={{ color: 'var(--bp-lime)' }}
              >
                <span className="bp-chip-dot" /> A Soady Poppers Brand
              </Link>

              <h1 className="mt-6 flex flex-col items-center lg:items-start">
                <span className="bp-throw bp-throw-hero text-6xl md:text-8xl" style={vars({ '--bp-fill': 'var(--bp-cyan)', '--bp-shadow': 'var(--bp-purple)' })}>
                  Big Poppa&rsquo;s
                </span>
                <span className="bp-throw text-5xl md:text-7xl bp-tilt-r mt-2" style={vars({ '--bp-fill': 'var(--bp-pink)', '--bp-shadow': 'var(--bp-lime)' })}>
                  Kettle Corn
                </span>
              </h1>

              <p className="mt-6 bp-tag text-2xl md:text-3xl bp-neon-lime">{bigPoppa.tagline}</p>

              <p className="mt-5 text-base md:text-lg max-w-md mx-auto lg:mx-0" style={{ color: 'var(--bp-bone)', opacity: 0.82 }}>
                {bigPoppa.blurb}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                <div className="relative">
                  <a href="#flavors" className="bp-btn">Meet the Flavors</a>
                  <SprayArrow className="hidden sm:block absolute -right-14 -top-8 w-14 rotate-[8deg]" color="var(--bp-lime)" />
                </div>
                <Link href="/visit" className="bp-btn bp-btn-ghost">Find Us at the Shop</Link>
              </div>
            </div>

            {/* Neon logo — already black-backed, glows straight into the wall */}
            <div className="relative flex justify-center">
              <div
                className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] bp-glow"
                style={{ background: 'radial-gradient(circle, var(--bp-pink) 0%, transparent 65%)', opacity: 0.55 }}
              />
              <div className="bp-flicker relative">
                <Image
                  src="/poppas-logo.jpg"
                  alt="Big Poppa's Kettle Corn neon graffiti logo"
                  width={500}
                  height={500}
                  priority
                  className="w-64 h-64 md:w-[24rem] md:h-[24rem] object-contain rounded-full"
                  style={{ filter: 'drop-shadow(0 0 34px rgba(47,227,240,0.35))' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATEMENT BAND ===================== */}
      <section className="relative overflow-hidden bp-concrete border-y" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="absolute inset-0 bp-spray opacity-50" />
        <Splat className="absolute top-1/2 -translate-y-1/2 left-[6%] w-24 opacity-60 rotate-[160deg]" color="var(--bp-lime)" />
        <Splat className="absolute top-1/2 -translate-y-1/2 right-[6%] w-24 opacity-60 -rotate-[30deg]" color="var(--bp-yellow)" />

        <div className="container mx-auto px-4 py-14 md:py-16 text-center relative">
          <span className="bp-tag text-lg md:text-xl bp-neon-cyan">Est. Fairview, MI</span>
          <p className="bp-throw text-4xl md:text-6xl mt-3" style={vars({ '--bp-fill': 'var(--bp-bone)', '--bp-shadow': 'var(--bp-pink)' })}>
            Fresh Outta The Kettle
          </p>
          <p className="mt-4 bp-tag text-base md:text-lg" style={{ color: 'var(--bp-muted)' }}>
            Popped loud &middot; Bagged by hand &middot; No corners cut
          </p>
        </div>
      </section>

      {/* ========================= FLAVORS ========================= */}
      <section id="flavors" className="relative overflow-hidden bp-concrete scroll-mt-20">
        <div className="absolute inset-0 bp-spray opacity-60" />
        {/* pink paint dripping in from the top edge */}
        <Drips className="absolute top-0 left-0 w-full" color="var(--bp-pink)" />
        <Splat className="absolute top-[30%] -right-6 w-40 opacity-40 rotate-45" color="var(--bp-lime)" />

        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32 md:pb-24 relative">
          <div className="text-center mb-14 flex flex-col items-center">
            <span className="bp-swipe bp-graffiti text-lg tracking-[0.12em]" style={vars({ color: '#0a0a0c', '--bp-swipe-color': 'var(--bp-lime)' })}>
              The Lineup
            </span>
            <h2 className="bp-throw text-5xl md:text-7xl mt-4" style={vars({ '--bp-fill': 'var(--bp-bone)', '--bp-shadow': 'var(--bp-pink)' })}>
              Pick Your Bag
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bigPoppa.flavors.map((f, idx) => {
              const n = NEON[f.color];
              return (
                <div
                  key={f.name}
                  className="bp-card p-6 pt-7 flex flex-col"
                  style={{ transform: idx % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)' }}
                >
                  {/* dripping paint tab instead of a clean bar */}
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: n.fill, boxShadow: `0 0 14px ${n.glow}` }} />
                  <span className="absolute top-1.5 left-6 w-3 h-4 rounded-b-full" style={{ background: n.fill }} />
                  <span className="absolute top-1.5 left-14 w-2.5 h-6 rounded-b-full" style={{ background: n.fill }} />
                  <span className="absolute top-1.5 right-9 w-2 h-3 rounded-b-full" style={{ background: n.fill }} />

                  <h3
                    className="bp-throw text-3xl"
                    style={vars({ '--bp-fill': n.fill, '--bp-shadow': '#08080a' })}
                  >
                    {f.name}
                  </h3>
                  <p className="bp-tag text-lg mt-2" style={{ color: 'var(--bp-bone)', opacity: 0.92 }}>
                    &ldquo;{f.tag}&rdquo;
                  </p>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--bp-muted)' }}>{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs bp-graffiti tracking-wider" style={{ color: n.fill }}>
                    <span className="bp-chip-dot" style={{ color: n.fill }} /> Kettle Corn
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-12 bp-tag text-lg" style={{ color: 'var(--bp-bone)', opacity: 0.85 }}>
            + rotating small-batch drops — flavors switch up with the season &amp; the mood.
          </p>
        </div>
      </section>

      {/* ==================== KETTLE GALLERY ==================== */}
      <section className="relative overflow-hidden bp-brick">
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,10,12,0.74)' }} />
        <Drips className="absolute top-0 left-0 w-full" color="var(--bp-cyan)" />

        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32 md:pb-24 relative">
          <div className="text-center mb-14 flex flex-col items-center">
            <span className="inline-flex items-center gap-3">
              <Cassette className="w-12 opacity-80" color="var(--bp-cyan)" />
              <span className="bp-swipe bp-graffiti text-lg tracking-[0.12em]" style={vars({ color: '#0a0a0c', '--bp-swipe-color': 'var(--bp-cyan)' })}>
                Straight From The Kettle
              </span>
            </span>
            <h2 className="bp-throw text-4xl md:text-6xl mt-4" style={{ ['--bp-fill' as string]: 'var(--bp-cyan)', ['--bp-shadow' as string]: 'var(--bp-pink)' }}>
              Popped Fresh, Bagged By Hand
            </h2>
          </div>

          {/* taped-up flyers on the brick wall */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-5 items-start">
            <TapedPhoto rotate={-2} className="col-span-2 lg:col-span-6">
              <GalleryFrame src="/popcorn2.jpg" alt="Big Poppa's flavor lineup on the shop shelf" ratio="lg:aspect-[16/10] aspect-[4/3]" />
            </TapedPhoto>
            <TapedPhoto rotate={2} className="lg:col-span-6">
              <GalleryFrame src="/popcorn1.jpg" alt="Hand-bagged kettle corn stacked on the brick shelf" ratio="aspect-[4/3]" />
            </TapedPhoto>
            <TapedPhoto rotate={-3} className="lg:col-span-3 mt-2">
              <GalleryFrame src="/popcorn3.jpg" alt="Close-up of green caramel-apple kettle corn" ratio="aspect-square" />
            </TapedPhoto>
            <TapedPhoto rotate={3} className="lg:col-span-3 mt-2">
              <GalleryFrame src="/popcorn4.jpg" alt="Close-up of electric-blue candied kettle corn" ratio="aspect-square" />
            </TapedPhoto>
          </div>
        </div>
      </section>

      {/* =================== ELITE EATS (black + gold) =================== */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#0c0a06' }}>
        <Drips className="absolute top-0 left-0 w-full" color="var(--bp-gold)" />
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(60% 60% at 70% 30%, rgba(216,180,90,0.18) 0%, transparent 70%)' }}
        />
        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32 md:pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Crown className="w-14 mb-4" color="var(--bp-gold)" />
              <span className="bp-chip" style={{ color: 'var(--bp-gold)' }}>
                <span className="bp-chip-dot" /> {bigPoppa.elite.sub}
              </span>
              <h2
                className="bp-throw text-6xl md:text-8xl mt-5"
                style={{ ['--bp-fill' as string]: 'var(--bp-gold)', ['--bp-shadow' as string]: '#1c1405' }}
              >
                {bigPoppa.elite.name}
              </h2>
              <p className="bp-tag text-xl md:text-2xl mt-4" style={{ color: 'var(--bp-gold-soft)' }}>
                {bigPoppa.elite.tagline}
              </p>
              <p className="mt-5 text-base md:text-lg max-w-md" style={{ color: 'var(--bp-bone)', opacity: 0.82 }}>
                {bigPoppa.elite.desc}
              </p>
              <div className="mt-8">
                <Link href="/visit" className="bp-btn bp-btn-gold">Grab a Bag In-Store</Link>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <Star className="absolute -top-5 -left-4 w-8 z-10" color="var(--bp-gold)" />
                <div className="absolute -inset-3 rounded-[1.75rem] rotate-2" style={{ border: '1.5px solid rgba(216,180,90,0.45)' }} />
                <Image
                  src="/elite-eats.jpg"
                  alt="Big Poppa's Elite Eats premium popcorn collection in kraft bags with black-and-gold labels"
                  width={900}
                  height={1100}
                  className="relative w-full max-w-sm rounded-[1.5rem] object-cover -rotate-1"
                  style={{ boxShadow: '0 24px 60px -20px rgba(216,180,90,0.55)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FIND US / CTA ======================= */}
      <section className="relative overflow-hidden bp-concrete">
        <div className="absolute inset-0 bp-spray opacity-70" />
        <Drips className="absolute top-0 left-0 w-full" color="var(--bp-lime)" />
        <div className="bp-glow absolute -bottom-24 left-1/3 w-[460px] h-[300px]" style={{ background: 'var(--bp-pink)', opacity: 0.4 }} />
        <Splat className="absolute top-[22%] left-[8%] w-24 opacity-50 -rotate-12" color="var(--bp-cyan)" />
        <Splat className="absolute bottom-[16%] right-[10%] w-28 opacity-50 rotate-12" color="var(--bp-pink)" />

        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32 md:pb-24 text-center relative">
          <span className="bp-swipe bp-graffiti text-lg tracking-[0.12em]" style={{ color: '#0a0a0c', ['--bp-swipe-color' as string]: 'var(--bp-lime)' }}>
            Now Popping
          </span>
          <h2 className="bp-throw text-5xl md:text-7xl mt-4" style={{ ['--bp-fill' as string]: 'var(--bp-bone)', ['--bp-shadow' as string]: 'var(--bp-cyan)' }}>
            Get It At Soady Poppers
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base md:text-lg" style={{ color: 'var(--bp-bone)', opacity: 0.85 }}>
            Big Poppa&rsquo;s is popped fresh and hand-bagged at the Soady Poppers shop in {shop.town}.
            Swing by, grab a bag, and see which flavor&rsquo;s dropping today.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/visit" className="bp-btn">Hours &amp; Directions</Link>
            <a href={shop.facebook} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn-ghost">
              Follow the Drops
            </a>
          </div>
          <p className="mt-10 bp-tag text-2xl bp-neon-pink">Small Batch. Big Flavor.</p>
        </div>
      </section>
    </div>
  );
}

// Small helper: build a style object carrying CSS custom properties (--bp-*).
// These React types have no `--${string}` index signature, so we cast once here
// instead of sprinkling casts across every heading.
function vars(v: Record<string, string>): React.CSSProperties {
  return v as React.CSSProperties;
}

// A single taped photo frame — fixed-ratio box with a chunky white flyer border.
function GalleryFrame({ src, alt, ratio }: { src: string; alt: string; ratio: string }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ border: '5px solid var(--bp-bone)', borderRadius: '8px', boxShadow: '0 18px 38px -16px rgba(0,0,0,0.8)' }}
    >
      <div className={`relative w-full ${ratio}`}>
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 40vw" />
      </div>
    </div>
  );
}
