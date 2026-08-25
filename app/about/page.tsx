import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { topSeller } from '@/lib/shop';

export const metadata: Metadata = {
  title: 'Our Story — Soady Poppers Soda Pop Shop | Fairview, MI',
  description:
    "The story behind Soady Poppers — a family-run soda pop shop in Fairview, Michigan named after the goodest dog around, and home of Big Poppa's Kettle Corn.",
};

const values = [
  { emoji: '🍓', title: 'Made fresh, to order', body: 'Every soda, lemonade and latte is built when you order it — nothing sits around.' },
  { emoji: '🎨', title: 'Your combo, your call', body: 'Over 20 flavors to mix and match. Dreaming one up? We’ll make it happen, ingredients permitting.' },
  { emoji: '🐶', title: 'Named after the pup', body: 'Our heart-sunglasses mascot is a real member of the family — the face of the whole shop.' },
  { emoji: '🏡', title: 'Small-town proud', body: 'Family-owned in Fairview, and part of what makes this little corner of Michigan sweet.' },
];

export default function AboutPage() {
  return (
    <>

      {/* Meet the mascot */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center">
              <Image
                src="/real-soady.webp"
                alt="The real dog behind the Soady Poppers logo"
                width={900}
                height={1100}
                className="w-full max-w-sm rounded-[1.5rem] object-cover border-2 border-[var(--charcoal)] rotate-[-1.5deg]"
                style={{ boxShadow: '8px 10px 0 rgba(62,154,166,0.5)' }}
              />
            </div>
            <div>
              <span className="eyebrow mb-3 inline-block">Meet the boss</span>
              <h2 className="text-3xl md:text-4xl">The face behind the shades</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--ash)' }}>
                That pup in the pink heart sunglasses on every cup, banner and sign? He’s the real deal — the
                good boy the whole shop is named for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Family + ribbon cutting */}
      <section className="py-12" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="eyebrow mb-3 inline-block">Family-owned</span>
              <h2 className="text-3xl md:text-4xl">Proud to be part of Fairview</h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--ash)' }}>
            Soady Poppers is our family’s little corner of town — and home of Big Poppa’s Kettle
                Corn, popped fresh right here.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/menu" className="btn-pop">See the Menu</Link>
                <Link href="/visit" className="btn-outline">Come Visit</Link>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/ribbon-cutting.webp"
                alt="Soady Poppers grand-opening ribbon cutting"
                width={1400}
                height={900}
                className="w-full max-w-lg rounded-[1.5rem] object-cover border-2 border-[var(--charcoal)]"
                style={{ boxShadow: '8px 10px 0 rgba(240,121,159,0.55)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--teal-deep)' }}>
        <div className="container mx-auto px-4 section-padding text-center relative">
          <h2 className="text-3xl md:text-5xl" style={{ color: 'var(--bone)' }}>
            Come say <span className="font-script" style={{ color: 'var(--lemon)' }}>hi</span>
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: 'var(--bone)', opacity: 0.85 }}>
            Meet the family and find your new favorite drink.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/menu" className="btn-pop">See the Menu</Link>
            <Link href="/visit" className="btn-outline btn-outline-cream">Hours & Directions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
