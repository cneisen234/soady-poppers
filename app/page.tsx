import Link from 'next/link';
import Image from 'next/image';
import { shop, topSeller, popcorn } from '@/lib/shop';
import OpenStatus from '@/components/OpenStatus';

const categories = [
  {
    href: '/menu#dirty-soda',
    label: 'Dirty Sodas',
    blurb: 'Your pop, loaded with syrups, cream & cold foam.',
    accent: 'var(--magenta)',
    emoji: '🥤',
  },
  {
    href: '/menu#lemonade',
    label: 'Fresh Lemonade',
    blurb: 'Squeezed to order — classic, flavored or dirty.',
    accent: 'var(--lemon-deep)',
    emoji: '🍋',
  },
  {
    href: '/menu#energy',
    label: 'Energy & Fizzy',
    blurb: 'Main-character energy and sparkling refreshers.',
    accent: 'var(--teal)',
    emoji: '⚡',
  },
  {
    href: '/menu#popcorn',
    label: 'Kettle Corn',
    blurb: "Big Poppa's, popped fresh and hand-bagged.",
    accent: 'var(--pink-deep)',
    emoji: '🍿',
  },
];

const favorites = [
  { name: 'Pretty in Pink', desc: 'Strawberry · Cupcake · White Chocolate · Cold Foam', tag: 'Dirty Soda' },
  { name: 'Tropic Like It’s Hot', desc: 'Pineapple · Coconut · Passion Fruit · Coconut Cream', tag: 'Lemonade' },
  { name: 'Blue Lightning Pop', desc: 'Blue Razz · Lime · Cotton Candy · Cold Foam', tag: 'Energy' },
  { name: 'Bedrock Baddie', desc: 'Strawberry · White Choc Drizzle · Cream · Cereal Topping', tag: 'Dirty Soda' },
  { name: 'Mango Tango', desc: 'Mango · Tangerine · Lime · Kiwi · Cold Foam', tag: 'Fizzy Fix' },
  { name: 'Love You Cherry Much', desc: 'Cherry · Vanilla · Cold Foam', tag: 'Dirty Soda' },
];

export default function Home() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden dot-texture">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--pink-soft) 0%, var(--cream) 62%)', opacity: 0.85 }} />
        {/* floating sparkles */}
        <Sparkle className="top-16 left-[12%] text-2xl twinkle" />
        <Sparkle className="top-40 right-[16%] text-lg twinkle" style={{ animationDelay: '1s' }} />
        <Sparkle className="bottom-24 left-[22%] text-xl twinkle" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center py-16 md:py-24">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="fade-in-up flex justify-center lg:justify-start">
                <span className="badge">
                  <span className="badge-dot" /> {shop.town_short}
                </span>
              </div>
              <h1 className="fade-in-up stagger-1 mt-5">
                <span className="block wordmark text-5xl md:text-7xl">Soady Poppers</span>
                <span
                  className="block mt-2 text-lg md:text-xl font-bold uppercase tracking-[0.28em]"
                  style={{ color: 'var(--teal-deep)', fontFamily: 'var(--font-fredoka)' }}
                >
                  Soda Pop Shop
                </span>
              </h1>
              <p className="fade-in-up stagger-2 mt-6 text-lg md:text-xl max-w-md mx-auto lg:mx-0" style={{ color: 'var(--ash)' }}>
                Hand-crafted <strong style={{ color: 'var(--magenta)' }}>dirty sodas</strong>, fresh-squeezed{' '}
                <strong style={{ color: 'var(--lemon-deep)' }}>lemonade</strong> & Big Poppa's{' '}
                <strong style={{ color: 'var(--pink-deep)' }}>gourmet kettle corn</strong>. Made fresh, made fun.
              </p>
              <div className="fade-in-up stagger-3 mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/menu" className="btn-pop text-base">See the Menu</Link>
                <Link href="/visit" className="btn-outline text-base">Visit the Shop</Link>
              </div>
              <div className="fade-in-up stagger-4 mt-6 flex items-center gap-3 justify-center lg:justify-start">
                <OpenStatus />
                <span style={{ color: 'var(--stone)' }}>·</span>
              </div>
            </div>

            {/* Hero image — the money shot */}
            <div className="relative fade-in-up stagger-2">
              <div className="relative mx-auto max-w-sm">
                <div
                  className="absolute -inset-3 rounded-[2rem] -rotate-2"
                  style={{ background: 'var(--lemon-soft)', border: '2px solid var(--charcoal)' }}
                />
                <div className="relative rounded-[1.75rem] overflow-hidden border-2 border-[var(--charcoal)] rotate-1" style={{ boxShadow: '8px 10px 0 rgba(240,121,159,0.55)' }}>
                  <Image
                    src="/drink.jpeg"
                    alt="A Soady Poppers layered lemonade in a logo cup"
                    width={900}
                    height={1200}
                    priority
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* floating mascot badge */}
                <div className="absolute -top-6 -right-4 w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--charcoal)] floaty" style={{ boxShadow: '3px 3px 0 var(--charcoal)' }}>
                  <Image src="/soady-poppers-logo.jpg" alt="Soady Poppers mascot" width={200} height={200} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- PICK YOUR VIBE ---------------- */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl">What are we sippin’ today?</h2>
            <div className="divider-pop mt-5" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c, i) => (
              <Link
                key={c.label}
                href={c.href}
                className={`card-pop ${i % 3 === 1 ? 'card-pop-teal' : i % 3 === 2 ? 'card-pop-lemon' : ''} p-6 flex flex-col items-start group`}
              >
                <span className="text-4xl mb-3" aria-hidden="true">{c.emoji}</span>
                <h3 className="text-xl mb-1" style={{ color: c.accent }}>{c.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ash)' }}>{c.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-fredoka)' }}>
                  See it
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SIGNATURE DRINK (dark band) ---------------- */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--teal-deep)' }}>
        <div
          className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--pink) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }}
        />
        <div className="container mx-auto px-4 section-padding relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <span className="eyebrow eyebrow-on-dark mb-3 inline-block">Our #1 seller</span>
              <h2 className="text-4xl md:text-5xl" style={{ color: 'var(--bone)' }}>
                <span className="font-script" style={{ color: 'var(--pink)' }}>{topSeller.name}</span>
              </h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--bone)' }}>{topSeller.desc}</p>
              <p className="mt-3 max-w-md" style={{ color: 'var(--bone)', opacity: 0.8 }}>{topSeller.note}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/menu" className="btn-pop">Explore the Menu</Link>
                <Link href="/visit" className="btn-outline btn-outline-cream">Visit the Shop</Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <Image
                  src="/soady-poppers-banner.jpg"
                  alt="Soady Poppers mascot dog in heart sunglasses among lemons and flowers"
                  width={1200}
                  height={800}
                  className="w-full max-w-md rounded-[1.5rem] object-cover border-2 border-[var(--bone)]"
                  style={{ boxShadow: '8px 10px 0 rgba(232,48,138,0.45)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAN FAVORITES ---------------- */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="eyebrow mb-3">Crowd pleasers</span>
            <h2 className="text-3xl md:text-4xl">Fan favorites</h2>
            <div className="divider-pop mt-5" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((f, i) => (
              <div key={f.name} className={`card-pop ${i % 3 === 1 ? 'card-pop-teal' : i % 3 === 2 ? 'card-pop-lemon' : ''} p-6`}>
                <span className="badge badge-teal mb-3">{f.tag}</span>
                <h3 className="text-xl">{f.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--ash)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/menu" className="btn-teal">See the Full Menu</Link>
          </div>
        </div>
      </section>

      {/* ---------------- BIG POPPA'S KETTLE CORN (neon counterweight) ---------------- */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--ink)' }}>
        <div className="container mx-auto px-4 section-padding relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative flex justify-center">
              <Image
                src="/popcorn.jpg"
                alt="Fresh kettle corn in the popper at Soady Poppers"
                width={1200}
                height={900}
                className="w-full max-w-md rounded-[1.5rem] object-cover border-2"
                style={{ borderColor: 'var(--lime)', boxShadow: '8px 10px 0 rgba(174,219,69,0.35)' }}
              />
            </div>
            <div>
              <span className="eyebrow mb-3 inline-block" style={{ color: 'var(--lime)' }}>Home of</span>
              <h2 className="text-4xl md:text-5xl" style={{ color: 'var(--bone)' }}>
                Big Poppa’s <span style={{ color: 'var(--magenta)' }}>Kettle Corn</span>
              </h2>
              <p className="mt-4 text-lg max-w-md" style={{ color: 'var(--bone)', opacity: 0.85 }}>
                {popcorn.tagline} {popcorn.note}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {popcorn.flavors.map((fl) => (
                  <span key={fl} className="badge badge-on-dark">{fl}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAMILY / COMMUNITY ---------------- */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Image src="/owners.jpeg" alt="The Soady Poppers family" width={800} height={800} className="w-full h-full object-cover rounded-[1.25rem] border-2 border-[var(--charcoal)] rotate-[-2deg]" style={{ boxShadow: '5px 5px 0 rgba(62,154,166,0.5)' }} />
                <Image src="/real-soady.jpeg" alt="The real mascot dog behind Soady Poppers" width={800} height={800} className="w-full h-full object-cover rounded-[1.25rem] border-2 border-[var(--charcoal)] rotate-[2deg] mt-6" style={{ boxShadow: '5px 5px 0 rgba(240,121,159,0.55)' }} />
              </div>
            </div>
            <div>
              <span className="eyebrow mb-3 inline-block">A little family shop</span>
              <h2 className="text-3xl md:text-4xl">Small town. Big flavor. Real people.</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--ash)' }}>
                Soady Poppers is a family-run spot right here in Fairview, named after the goodest dog around,
                built on fresh ingredients, endless flavor combos and a whole lot of small-town heart.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/about" className="btn-pop">Our Story</Link>
                <Link href="/visit" className="btn-outline">Visit & Hours</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="relative overflow-hidden dot-texture-teal" style={{ backgroundColor: 'var(--pink-soft)' }}>
        {/* Soft spotlight keeps the dots at the edges but clears them behind the text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(62% 68% at 50% 48%, rgba(252,248,236,0.95) 0%, rgba(251,221,231,0.82) 46%, rgba(251,221,231,0) 80%)',
          }}
        />
        <div className="container mx-auto px-4 section-padding text-center relative">
          <h2 className="text-4xl md:text-5xl">
            Get <span className="font-script" style={{ color: 'var(--magenta)' }}>poppin’</span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/menu" className="btn-pop text-base">See the Menu</Link>
            <Link href="/visit" className="btn-outline text-base">Hours & Directions</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Sparkle({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ color: 'var(--magenta)', ...style }}
      aria-hidden="true"
    >
      ✦
    </span>
  );
}
