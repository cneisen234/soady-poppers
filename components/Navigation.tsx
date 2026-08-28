'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { shop } from '@/lib/shop';
import OpenStatus from './OpenStatus';

const links = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/big-poppas', label: "Big Poppa's" },
  { href: '/about', label: 'Our Story' },
  { href: '/visit', label: 'Visit' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Subtle backdrop blur once the page is scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the full-screen menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all"
        style={{
          backgroundColor: scrolled ? 'rgba(246, 240, 222, 0.88)' : 'var(--cream)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'rgba(240, 121, 159, 0.3)' : 'transparent'}`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Wordmark — the mascot badge + the script name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/soady-poppers-logo.webp"
                alt="Soady Poppers Soda Pop Shop"
                width={200}
                height={200}
                priority
                className="h-11 w-11 rounded-full object-cover border-2 border-[var(--charcoal)] shrink-0 transition-transform group-hover:-rotate-6 group-hover:scale-105"
              />
              <span className="leading-none">
                <span className="block wordmark text-xl md:text-2xl">Soady Poppers</span>
                <span
                  className="block text-[0.6rem] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'var(--teal-deep)', fontFamily: 'var(--font-fredoka)' }}
                >
                  Soda Pop Shop
                </span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-1" style={{ fontFamily: 'var(--font-fredoka)' }}>
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="relative px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
                      style={{ color: active ? 'var(--magenta)' : 'var(--charcoal)' }}
                    >
                      {l.label}
                      <span
                        className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1.5 h-1.5 rounded-full transition-opacity"
                        style={{ backgroundColor: 'var(--magenta)', opacity: active ? 1 : 0 }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right side: open-status + phone (secondary) + Order CTA (primary) */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end leading-tight">
                <OpenStatus />
                <a
                  href={shop.phoneHref}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'var(--stone)' }}
                >
                  {shop.phone}
                </a>
              </div>
              <Link href="/menu" className="btn-pop text-sm">
                See the Menu
              </Link>
            </div>

            {/* Open status + hamburger — mobile only */}
            <div className="md:hidden flex items-center gap-2.5">
              <OpenStatus compact />
              <button
                className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ backgroundColor: isOpen ? 'var(--magenta)' : 'rgba(240, 121, 159, 0.14)' }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                <div className="relative w-5 h-4 flex flex-col justify-between">
                  <span
                    className="block h-0.5 w-full transition-all origin-center rounded-full"
                    style={{
                      backgroundColor: isOpen ? 'var(--bone)' : 'var(--charcoal)',
                      transform: isOpen ? 'rotate(45deg) translate(4px, 5px)' : 'none',
                    }}
                  />
                  <span
                    className="block h-0.5 w-full transition-all rounded-full"
                    style={{ backgroundColor: isOpen ? 'var(--bone)' : 'var(--charcoal)', opacity: isOpen ? 0 : 1 }}
                  />
                  <span
                    className="block h-0.5 w-full transition-all origin-center rounded-full"
                    style={{
                      backgroundColor: isOpen ? 'var(--bone)' : 'var(--charcoal)',
                      transform: isOpen ? 'rotate(-45deg) translate(4px, -5px)' : 'none',
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'var(--teal-deep)' }}
      >
        {/* Ambient pink + lemon glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--pink) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--lemon) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative h-full flex flex-col pt-24 pb-10 px-8">
          <nav className="flex-1 flex flex-col justify-center">
            <ul className="space-y-1">
              {links.map((l, idx) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href} className={isOpen ? 'fade-in-up' : ''} style={{ animationDelay: `${idx * 60}ms` }}>
                    <Link href={l.href} onClick={() => setIsOpen(false)} className="group flex items-baseline py-2.5">
                      <span
                        className="font-script text-4xl transition-colors"
                        style={{ color: active ? 'var(--lemon)' : 'var(--bone)' }}
                      >
                        {l.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA + contact at the bottom of the overlay */}
          <div className="pt-8" style={{ borderTop: '1px solid rgba(251, 246, 234, 0.2)' }}>
            <Link
              href="/menu"
              onClick={() => setIsOpen(false)}
              className="btn-pop w-full text-lg"
            >
              See the Menu
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
