import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  shop,
  menuSections,
  dirtySoda,
  lemonade,
  energyDrinks,
  fizzyFix,
  lattes,
  popcorn,
  topSeller,
  addOns,
  type MenuGroup,
  type DrinkItem,
  type PriceTier,
  type Accent,
} from '@/lib/shop';

export const metadata: Metadata = {
  title: 'Menu — Dirty Sodas, Lemonade, Energy & Kettle Corn | Soady Poppers',
  description:
    "The full Soady Poppers menu: dirty sodas, fresh-squeezed lemonade, Main Character energy refreshers, Fizzy Fix sparkling waters, iced & chai lattes, and Big Poppa's gourmet kettle corn. Made fresh in Fairview, MI.",
};

const accentColor: Record<Accent, string> = {
  pink: 'var(--pink-deep)',
  teal: 'var(--teal-deep)',
  lemon: 'var(--lemon-deep)',
  magenta: 'var(--magenta)',
  lime: 'var(--pine)',
};

function Tiers({ tiers }: { tiers: readonly PriceTier[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tiers.map((t) => (
        <span
          key={t.label}
          className="inline-flex items-baseline gap-1.5 rounded-full px-3.5 py-1.5 text-sm"
          style={{ backgroundColor: 'var(--paper)', border: '2px solid var(--charcoal)', boxShadow: '2px 2px 0 var(--charcoal)' }}
        >
          <strong style={{ fontFamily: 'var(--font-fredoka)' }}>{t.label}</strong>
          {t.detail && <span style={{ color: 'var(--stone)' }} className="text-xs">{t.detail}</span>}
          <span style={{ color: 'var(--magenta)', fontFamily: 'var(--font-fredoka)' }} className="font-bold">{t.price}</span>
        </span>
      ))}
    </div>
  );
}

function DrinkList({ items, accent }: { items: DrinkItem[]; accent: Accent }) {
  return (
    <ul className="space-y-3.5">
      {items.map((it) => (
        <li key={it.name}>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold" style={{ fontFamily: 'var(--font-fredoka)', color: accentColor[accent] }}>
              {it.name}
            </span>
          </div>
          <p className="text-sm leading-snug" style={{ color: 'var(--ash)' }}>{it.desc}</p>
          {it.note && <p className="text-xs italic mt-0.5" style={{ color: 'var(--stone)' }}>{it.note}</p>}
        </li>
      ))}
    </ul>
  );
}

function GroupCard({ group }: { group: MenuGroup }) {
  const shadow =
    group.accent === 'teal' ? 'card-pop-teal' : group.accent === 'lemon' ? 'card-pop-lemon' : '';
  return (
    <div className={`card-pop ${shadow} p-6`}>
      <h3 className="text-xl mb-4" style={{ color: accentColor[group.accent] }}>{group.title}</h3>
      <DrinkList items={group.items} accent={group.accent} />
    </div>
  );
}

function SectionHeader({ id, eyebrow, title, tagline, tiers }: {
  id: string; eyebrow: string; title: string; tagline: string; tiers: readonly PriceTier[];
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-8">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-3xl md:text-4xl mt-2">{title}</h2>
      <p className="mt-2 text-lg" style={{ color: 'var(--ash)' }}>{tagline}</p>
      <div className="mt-4"><Tiers tiers={tiers} /></div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden dot-texture">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--lemon-soft) 0%, var(--cream) 70%)', opacity: 0.8 }} />
        <div className="container mx-auto px-4 relative py-14 md:py-20 text-center">
          <span className="badge mb-4"><span className="badge-dot" /> Made fresh to order</span>
          <h1 className="text-4xl md:text-6xl">
            The <span className="font-script" style={{ color: 'var(--magenta)' }}>Menu</span>
          </h1>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/visit" className="btn-pop">Visit Us in Fairview</Link>
            <Link href="/visit" className="btn-outline">Hours & Directions</Link>
          </div>
        </div>
      </section>

      {/* Sticky category rail */}
      <div className="sticky top-18 z-30" style={{ backgroundColor: 'rgba(246,240,222,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4">
          <ul className="flex gap-2 overflow-x-auto no-scrollbar py-3">
            {menuSections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                  style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--charcoal)', backgroundColor: 'var(--paper)', border: '1.5px solid var(--border)' }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Signature callout */}
      <section className="container mx-auto px-4 pt-12">
        <div className="rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6" style={{ background: 'linear-gradient(120deg, var(--pink-soft), var(--lemon-soft))', border: '2px solid var(--charcoal)', boxShadow: '6px 6px 0 var(--charcoal)' }}>
          <Image src="/soady-poppers-logo.jpg" alt="Soady Poppers mascot" width={200} height={200} className="w-24 h-24 rounded-full object-cover border-2 border-[var(--charcoal)] shrink-0" />
          <div className="text-center md:text-left">
            <span className="eyebrow">Our #1 seller</span>
            <h2 className="text-2xl md:text-3xl mt-1">
              <span className="font-script" style={{ color: 'var(--magenta)' }}>{topSeller.name}</span>
            </h2>
            <p className="mt-1 font-semibold" style={{ color: 'var(--charcoal)' }}>{topSeller.desc}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--ash)' }}>{topSeller.note}</p>
          </div>
        </div>
      </section>

      {/* Dirty Soda */}
      <section className="section-padding pb-10">
        <div className="container mx-auto px-4">
          <SectionHeader id={dirtySoda.id} eyebrow="Loaded pop" title="Dirty Soda" tagline={dirtySoda.tagline} tiers={dirtySoda.tiers} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dirtySoda.groups.map((g) => <GroupCard key={g.title} group={g} />)}
          </div>
          <p className="mt-6 text-center text-sm italic" style={{ color: 'var(--stone)' }}>{dirtySoda.note}</p>
        </div>
      </section>

      {/* Lemonade */}
      <section className="py-10" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <SectionHeader id={lemonade.id} eyebrow="Squeezed fresh" title="Fresh-Squeezed Lemonade" tagline={lemonade.tagline} tiers={lemonade.tiers} />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-pop card-pop-lemon p-6">
              <h3 className="text-xl mb-4" style={{ color: 'var(--lemon-deep)' }}>{lemonade.flavored.title}</h3>
              <DrinkList items={lemonade.flavored.items} accent="lemon" />
            </div>
            <div className="card-pop p-6">
              <h3 className="text-xl mb-4" style={{ color: 'var(--pink-deep)' }}>{lemonade.dirty.title}</h3>
              <DrinkList items={lemonade.dirty.items} accent="pink" />
            </div>
          </div>
          <p className="mt-6 text-center text-sm italic" style={{ color: 'var(--stone)' }}>{lemonade.note}</p>
        </div>
      </section>

      {/* Energy */}
      <section className="section-padding pb-10">
        <div className="container mx-auto px-4">
          <SectionHeader id={energyDrinks.id} eyebrow="⚡ Made with energy drinks" title={energyDrinks.label} tagline={energyDrinks.tagline} tiers={energyDrinks.tiers} />
          <div className="card-pop card-pop-teal p-6 md:p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3.5">
              {energyDrinks.items.map((it) => (
                <div key={it.name}>
                  <span className="text-base font-bold" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--teal-deep)' }}>{it.name}</span>
                  <p className="text-sm leading-snug" style={{ color: 'var(--ash)' }}>{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fizzy Fix */}
      <section className="py-10" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <SectionHeader id={fizzyFix.id} eyebrow="Sparkling water base" title={fizzyFix.label} tagline={fizzyFix.tagline} tiers={fizzyFix.tiers} />
          <div className="card-pop p-6 md:p-8">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {fizzyFix.items.map((it) => (
                <div key={it.name}>
                  <span className="text-base font-bold" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--pink-deep)' }}>{it.name}</span>
                  <p className="text-sm leading-snug" style={{ color: 'var(--ash)' }}>{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lattes */}
      <section className="section-padding pb-10">
        <div className="container mx-auto px-4">
          <SectionHeader id={lattes.id} eyebrow="Not feelin’ fizzy?" title="Iced & Chai Lattes" tagline={lattes.tagline} tiers={lattes.tiers} />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-pop card-pop-lemon p-6">
              <h3 className="text-xl mb-4" style={{ color: 'var(--lemon-deep)' }}>{lattes.iced.title}</h3>
              <ul className="space-y-2">
                {lattes.iced.flavors.map((f) => (
                  <li key={f} className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="card-pop card-pop-teal p-6">
              <h3 className="text-xl mb-4" style={{ color: 'var(--teal-deep)' }}>{lattes.chai.title}</h3>
              <ul className="space-y-2">
                {lattes.chai.flavors.map((f) => (
                  <li key={f} className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popcorn — Big Poppa's (neon band) */}
      <section id={popcorn.id} className="scroll-mt-24 relative overflow-hidden" style={{ backgroundColor: 'var(--ink)' }}>
        <div className="container mx-auto px-4 section-padding relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="eyebrow" style={{ color: 'var(--lime)' }}>Home of</span>
              <h2 className="text-3xl md:text-5xl mt-2" style={{ color: 'var(--bone)' }}>
                Big Poppa’s <span style={{ color: 'var(--magenta)' }}>Kettle Corn</span>
              </h2>
              <p className="mt-4 text-lg max-w-md" style={{ color: 'var(--bone)', opacity: 0.85 }}>
                {popcorn.tagline} {popcorn.note}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {popcorn.flavors.map((fl) => <span key={fl} className="badge badge-on-dark">{fl}</span>)}
              </div>
            </div>
            <div className="flex justify-center">
              <Image src="/more-popcorn.jpg" alt="Bags of Big Poppa's gourmet kettle corn" width={1200} height={800} className="w-full max-w-md rounded-[1.5rem] object-cover border-2" style={{ borderColor: 'var(--lime)', boxShadow: '8px 10px 0 rgba(174,219,69,0.35)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons + order CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <span className="eyebrow">Make it yours</span>
            <h2 className="text-2xl md:text-3xl mt-2">Add-ons</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {addOns.map((a) => <span key={a} className="badge badge-teal">{a}</span>)}
          </div>
          <div className="rounded-[1.5rem] p-8 text-center" style={{ background: 'var(--teal-deep)' }}>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/visit" className="btn-pop">Hours & Directions</Link>
              <Link href="/about" className="btn-outline btn-outline-cream">Our Story</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
