import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { listCatalog, type Product } from '@/lib/catalog';
import {
  menuSections,
  menuLayout,
  topSeller,
  popcorn,
  type PriceTier,
  type Accent,
  type MenuSectionConfig,
} from '@/lib/shop';
import { Drips, Splat, TapedPhoto, vars } from '@/components/bp-graffiti';

export const metadata: Metadata = {
  title: 'Menu — Dirty Sodas, Lemonade, Energy & Kettle Corn | Soady Poppers',
  description:
    "The full Soady Poppers menu: dirty sodas, fresh-squeezed lemonade, Main Character energy refreshers, Fizzy Fix sparkling waters, iced & chai lattes, and Big Poppa's gourmet kettle corn. Made fresh in Fairview, MI.",
};

// The catalog is admin-managed, so always render the live version.
export const dynamic = 'force-dynamic';

const accentColor: Record<Accent, string> = {
  pink: 'var(--pink-deep)',
  teal: 'var(--teal-deep)',
  lemon: 'var(--lemon-deep)',
  magenta: 'var(--magenta)',
  lime: 'var(--pine)',
};

const BP_STICKER = [
  { fill: 'var(--bp-yellow)', rot: -4 },
  { fill: 'var(--bp-lime)', rot: 3 },
  { fill: 'var(--bp-pink)', rot: -3 },
  { fill: 'var(--bp-cyan)', rot: 5 },
];

function money(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
function variationKey(p: Product | undefined): string {
  return (p?.variations ?? []).map((v) => `${v.name}:${v.priceCents}`).join('|');
}

// Price-tier chips derived from the section's own items: if every category shares
// the same sizes/prices, show those sizes; otherwise show one chip per category
// (e.g. lemonade — Classic / Flavored / Dirty).
function deriveTiers(section: MenuSectionConfig, byCat: Map<string, Product[]>): PriceTier[] {
  const perCat = section.groups
    .map((g) => ({ group: g, first: (byCat.get(g.category) ?? [])[0] }))
    .filter((c) => c.first && c.first.variations.length > 0);
  if (perCat.length === 0) return [];

  const uniform = new Set(perCat.map((c) => variationKey(c.first))).size === 1;
  if (uniform) {
    return perCat[0].first!.variations.map((v) => {
      const [label, ...rest] = v.name.split(' · ');
      return { label, detail: rest.join(' · ') || undefined, price: money(v.priceCents) };
    });
  }
  return perCat.map((c) => {
    const short = c.group.category.replace(/\s*Lemonade$/i, '').trim() || c.group.category;
    const v = c.first!.variations[0];
    return { label: short, detail: v.name, price: money(v.priceCents) };
  });
}

function Tiers({ tiers }: { tiers: PriceTier[] }) {
  if (tiers.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tiers.map((t) => (
        <span
          key={`${t.label}-${t.price}`}
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

function GroupCard({
  title,
  accent,
  items,
  wide,
}: {
  title: string;
  accent: Accent;
  items: Product[];
  wide?: boolean;
}) {
  const shadow = accent === 'teal' ? 'card-pop-teal' : accent === 'lemon' ? 'card-pop-lemon' : '';
  return (
    <div className={`card-pop ${shadow} p-6`}>
      <h3 className="text-xl mb-4" style={{ color: accentColor[accent] }}>{title}</h3>
      <ul className={wide ? 'grid sm:grid-cols-2 gap-x-8 gap-y-3.5' : 'space-y-3.5'}>
        {items.map((it) => (
          <li key={it.id}>
            <span className="text-base font-bold" style={{ fontFamily: 'var(--font-fredoka)', color: accentColor[accent] }}>
              {it.name}
            </span>
            {it.description && (
              <p className="text-sm leading-snug" style={{ color: 'var(--ash)' }}>{it.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function gridClass(count: number): string {
  if (count <= 1) return 'grid grid-cols-1 gap-6';
  if (count === 2) return 'grid md:grid-cols-2 gap-6';
  return 'grid md:grid-cols-2 lg:grid-cols-3 gap-6';
}

export default async function MenuPage() {
  const catalog = await listCatalog();

  // Group products by category name for quick lookup.
  const byCat = new Map<string, Product[]>();
  for (const p of catalog.products) {
    if (!p.categoryName) continue;
    const list = byCat.get(p.categoryName) ?? [];
    list.push(p);
    byCat.set(p.categoryName, list);
  }

  // Top seller — pull the live description from the catalog when available.
  const topSellerProduct = catalog.products.find((p) => p.name === topSeller.name);
  const topSellerDesc = topSellerProduct?.description ?? topSeller.desc;

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
            <Link href="/order" className="btn-pop">Order Online</Link>
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
          <Image src="/soady-poppers-logo.webp" alt="Soady Poppers mascot" width={200} height={200} className="w-24 h-24 rounded-full object-cover border-2 border-[var(--charcoal)] shrink-0" />
          <div className="text-center md:text-left">
            <span className="eyebrow">Our #1 seller</span>
            <h2 className="text-2xl md:text-3xl mt-1">
              <span className="font-script" style={{ color: 'var(--magenta)' }}>{topSeller.name}</span>
            </h2>
            <p className="mt-1 font-semibold" style={{ color: 'var(--charcoal)' }}>{topSellerDesc}</p>
          </div>
        </div>
      </section>

      {/* Drink sections — grouped per menuLayout, items pulled from the catalog */}
      {menuLayout.map((section) => {
        const tiers = deriveTiers(section, byCat);
        const single = section.groups.length === 1;
        return (
          <section
            key={section.id}
            id={section.id}
            className="section-padding pb-10 scroll-mt-24"
            style={section.altBg ? { backgroundColor: 'var(--paper)' } : undefined}
          >
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <span className="eyebrow">{section.eyebrow}</span>
                <h2 className="text-3xl md:text-4xl mt-2">{section.title}</h2>
                {section.tagline && <p className="mt-2 text-lg" style={{ color: 'var(--ash)' }}>{section.tagline}</p>}
                <div className="mt-4"><Tiers tiers={tiers} /></div>
              </div>
              <div className={gridClass(section.groups.length)}>
                {section.groups.map((g) => (
                  <GroupCard
                    key={g.category}
                    title={g.title ?? g.category}
                    accent={g.accent}
                    items={byCat.get(g.category) ?? []}
                    wide={single}
                  />
                ))}
              </div>
              {section.note && (
                <p className="mt-6 text-center text-sm italic" style={{ color: 'var(--stone)' }}>{section.note}</p>
              )}
            </div>
          </section>
        );
      })}

      {/* Order CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="rounded-[1.5rem] p-8 text-center" style={{ background: 'var(--teal-deep)' }}>
            <h2 className="text-2xl md:text-3xl" style={{ color: 'var(--bone)' }}>Ready for a pop?</h2>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/order" className="btn-pop">Order Online</Link>
              <Link href="/visit" className="btn-outline btn-outline-cream">Hours & Directions</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popcorn — Big Poppa's (branded closing gateway) */}
      <section id={popcorn.id} className="bp-scope scroll-mt-24 relative overflow-hidden bp-brick">
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,10,12,0.72)' }} />
        <div className="absolute inset-0 bp-spray opacity-50" />
        <Drips className="absolute top-0 left-0 w-full" color="var(--bp-pink)" />
        <Splat className="absolute top-[18%] left-[5%] w-28 opacity-65 rotate-[200deg]" color="var(--bp-lime)" />
        <Splat className="absolute bottom-[12%] right-[5%] w-32 opacity-60 -rotate-[30deg]" color="var(--bp-yellow)" />
        <Splat className="absolute top-[52%] left-[22%] w-20 opacity-35 rotate-45" color="var(--bp-cyan)" />

        <div className="container mx-auto px-4 pt-28 pb-20 md:pt-32 md:pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="bp-swipe bp-graffiti text-lg tracking-[0.12em]" style={vars({ color: '#0a0a0c', '--bp-swipe-color': 'var(--bp-cyan)' })}>
                Also from the shop
              </span>
              <h2 className="bp-throw text-4xl md:text-6xl mt-3" style={vars({ '--bp-fill': 'var(--bp-bone)', '--bp-shadow': 'var(--bp-pink)' })}>
                Big Poppa’s Kettle Corn
              </h2>
              <p className="mt-5 text-lg max-w-md" style={{ color: 'var(--bp-bone)', opacity: 0.85 }}>
                {popcorn.tagline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {popcorn.flavors.map((fl, i) => (
                  <span
                    key={fl}
                    className="bp-sticker text-base md:text-lg"
                    style={{ backgroundColor: BP_STICKER[i % BP_STICKER.length].fill, transform: `rotate(${BP_STICKER[i % BP_STICKER.length].rot}deg)` }}
                  >
                    {fl}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/big-poppas" className="bp-btn">See All the Flavors</Link>
              </div>
            </div>
            <div className="flex justify-center">
              <TapedPhoto rotate={2} className="w-full max-w-md">
                <div
                  className="relative overflow-hidden"
                  style={{ border: '5px solid var(--bp-bone)', borderRadius: '10px', boxShadow: '0 20px 44px -18px rgba(0,0,0,0.85)' }}
                >
                  <Image
                    src="/popcorn2.webp"
                    alt="Big Poppa's flavor lineup on the shop shelf"
                    width={1200}
                    height={800}
                    className="block w-full h-auto object-cover"
                  />
                </div>
              </TapedPhoto>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
