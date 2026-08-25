'use client';

import { useEffect, useState } from 'react';
import { getOpenStatus, type OpenState } from '@/lib/status';

// A decorative "hanging shop sign" that flips OPEN / CLOSED live from the hours
// table. Sticker-style to match the rest of the site: chunky charcoal outline,
// hard offset shadow, script + Fredoka type. Meant to be overlaid on a photo.
export default function OpenSign({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<OpenState | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const hydrated = status !== null;
  const open = status?.open ?? false;

  const headline = hydrated ? status!.headline : 'HELLO';
  const script = hydrated ? status!.script : 'Come see us';
  const sub = hydrated ? status!.sub : '';

  const headlineColor = !hydrated ? 'var(--teal-deep)' : open ? 'var(--pine)' : 'var(--magenta)';
  const scriptColor = !hydrated ? 'var(--stone)' : open ? 'var(--teal-deep)' : 'var(--pink-deep)';
  const shadowColor = open ? 'rgba(78,158,126,0.55)' : 'rgba(240,121,159,0.6)';

  return (
    <div className={`select-none ${className}`} aria-live="polite">
      {/* hook + string */}
      <div className="flex flex-col items-center">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--paper)', border: '2px solid var(--charcoal)' }}
          aria-hidden="true"
        />
        <span className="w-[2px] h-4" style={{ backgroundColor: 'var(--charcoal)' }} aria-hidden="true" />
      </div>

      {/* the sign */}
      <div
        className="relative rounded-2xl px-6 py-3.5 text-center"
        style={{
          backgroundColor: 'var(--paper)',
          border: '2px solid var(--charcoal)',
          boxShadow: `6px 7px 0 ${shadowColor}`,
          transform: 'rotate(-1.5deg)',
        }}
      >
        <span className="twinkle absolute -top-2 -left-2 text-sm" style={{ color: 'var(--lemon-deep)' }} aria-hidden="true">✦</span>
        <span className="twinkle absolute -bottom-2 -right-1 text-xs" style={{ color: 'var(--pink)' }} aria-hidden="true">✦</span>

        <p
          className="text-2xl md:text-3xl leading-none"
          style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 600, letterSpacing: '0.06em', color: headlineColor }}
        >
          {headline}
        </p>
        <p className="font-script text-lg md:text-xl mt-1 leading-none" style={{ color: scriptColor }}>
          {script}
        </p>
        {sub && (
          <p className="text-[0.72rem] font-semibold mt-1.5 uppercase tracking-wide" style={{ color: 'var(--stone)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
