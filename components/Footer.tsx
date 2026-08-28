import Link from 'next/link';
import Image from 'next/image';
import { shop, hoursDisplay } from '@/lib/shop';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden mt-auto" style={{ backgroundColor: 'var(--teal-deep)' }}>
      {/* Ambient glows echoing the mobile menu + the logo's watercolor sky */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--pink) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--lemon) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
      />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/soady-poppers-logo.webp"
                alt="Soady Poppers Soda Pop Shop"
                width={200}
                height={200}
                className="h-14 w-14 rounded-full object-cover border-2 border-[var(--bone)]"
              />
              <div className="leading-tight">
                <span className="block wordmark wordmark-cream text-2xl">Soady Poppers</span>
                <span
                  className="block text-[0.68rem] font-bold uppercase tracking-[0.2em]"
                  style={{ color: 'var(--lemon)', fontFamily: 'var(--font-fredoka)' }}
                >
                  Soda Pop Shop
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--bone)', opacity: 0.78 }}>
              {shop.blurb}
            </p>
            <p className="mt-5 font-script text-2xl" style={{ color: 'var(--lemon)' }}>
              Home of {shop.kettleCorn}
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--bone)', fontFamily: 'var(--font-fredoka)' }}>
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/menu', label: 'The Menu' },
                { href: '/big-poppas', label: "Big Poppa's Kettle Corn" },
                { href: '/about', label: 'Our Story' },
                { href: '/visit', label: 'Visit & Hours' },
                { href: shop.facebook, label: 'Facebook', external: true },
              ].map((l) => (
                <li key={l.href}>
                  {'external' in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:underline"
                      style={{ color: 'var(--bone)', opacity: 0.78 }}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="transition-colors hover:underline" style={{ color: 'var(--bone)', opacity: 0.78 }}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + hours */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--bone)', fontFamily: 'var(--font-fredoka)' }}>
              Visit Us
            </h4>
            <div className="space-y-2.5 text-sm" style={{ color: 'var(--bone)', opacity: 0.85 }}>
              <p>{shop.address}<br />{shop.cityStateZip}</p>
              <p>
                <a href={shop.phoneHref} className="font-semibold hover:underline" style={{ color: 'var(--bone)' }}>
                  {shop.phone}
                </a>{' '}
              </p>
              <a
                href={shop.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold hover:underline"
                style={{ color: 'var(--lemon)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
                </svg>
                Follow us on Facebook
              </a>

              <ul className="pt-3 space-y-1 text-[0.82rem]" style={{ opacity: 0.8 }}>
                {hoursDisplay.map((h) => (
                  <li key={h.label} className="flex justify-between max-w-[15rem]">
                    <span>{h.label}</span>
                    <span style={{ color: h.closed ? 'var(--pink)' : 'var(--bone)' }}>{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="pt-8 border-t text-center text-sm flex flex-col sm:flex-row sm:justify-between items-center gap-2"
          style={{ borderColor: 'rgba(251, 246, 234, 0.16)', color: 'var(--bone)', opacity: 0.72 }}
        >
          <p>&copy; {new Date().getFullYear()} {shop.fullName}. Made fresh in Fairview, Michigan.</p>
          <p className="text-xs">
            Website by{' '}
            <a
              href="https://www.kindlingdigital.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:underline"
              style={{ color: 'var(--lemon)' }}
            >
              Kindling Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
