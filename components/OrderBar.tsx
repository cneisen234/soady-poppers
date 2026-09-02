'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { shop } from '@/lib/shop';

// Mobile-only floating bar: keeps "Order Online" one tap away across the
// marketing pages, with the phone as an easy secondary. Hidden on the order
// flow itself (which has its own floating cart button).
export default function OrderBar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/order')) return null;

  return (
    <>
      {/* In-flow spacer so the fixed bar never covers page content (e.g. the
          footer credit). Only rendered when the bar is shown. */}
      <div
        className="md:hidden"
        aria-hidden
        style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 2.6rem)' }}
      />
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)]"
        style={{
          backgroundColor: 'rgba(37, 110, 122, 0.96)', // --teal-deep, the brand's dark band
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(244, 206, 60, 0.45)', // --lemon accent
        }}
      >
        <div className="flex items-center gap-2.5">
          <a
            href={shop.phoneHref}
            aria-label={`Call ${shop.name}`}
            className="flex items-center justify-center h-12 w-12 rounded-full shrink-0 transition-transform active:scale-95"
            style={{ border: '2px solid var(--lemon)', color: 'var(--lemon)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.24 1l-2.2 2.2z"
                fill="currentColor"
              />
            </svg>
          </a>
          <Link href="/order" className="btn-pop flex-1 text-base py-3">
            Order Online
          </Link>
        </div>
      </div>
    </>
  );
}
