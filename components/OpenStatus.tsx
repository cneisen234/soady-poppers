'use client';

import { useEffect, useState } from 'react';
import { getOpenStatus, type OpenState, type WeekHours } from '@/lib/status';

type Props = {
  /** compact = just the dot + Open/Closed (for the tight mobile bar) */
  compact?: boolean;
  className?: string;
  hours?: WeekHours;
};

// Branded open/closed pill. Green when open, pink when closed, with a live
// pulsing dot. Renders a neutral placeholder on the server, then hydrates with
// the real value to avoid a clock-driven hydration mismatch.
export default function OpenStatus({ compact = false, className = '', hours }: Props) {
  const [status, setStatus] = useState<OpenState | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(new Date(), hours));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  const open = status?.open ?? false;
  const hydrated = status !== null;
  const text = !hydrated ? 'Hours' : compact ? status!.short : status!.sub;

  // Colors: green = open, pink = closed, muted stone = pre-hydration placeholder
  const fg = !hydrated ? 'var(--stone)' : open ? 'var(--pine)' : 'var(--pink-deep)';
  const bg = !hydrated
    ? 'rgba(138,131,144,0.12)'
    : open
      ? 'rgba(78,158,126,0.15)'
      : 'rgba(240,121,159,0.16)';
  const border = !hydrated
    ? 'rgba(138,131,144,0.25)'
    : open
      ? 'rgba(78,158,126,0.4)'
      : 'rgba(216,91,132,0.4)';
  const dot = !hydrated ? 'var(--stone)' : open ? 'var(--leaf)' : 'var(--pink-deep)';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 leading-none whitespace-nowrap ${className}`}
      style={{
        backgroundColor: bg,
        border: `1.5px solid ${border}`,
        color: fg,
        fontFamily: 'var(--font-fredoka)',
        fontWeight: 600,
        fontSize: compact ? '0.72rem' : '0.76rem',
      }}
      aria-label={hydrated ? (open ? 'Open now' : 'Currently closed') : undefined}
    >
      <span
        className={`rounded-full ${open ? 'twinkle' : ''}`}
        style={{ width: '0.5rem', height: '0.5rem', backgroundColor: dot }}
        aria-hidden="true"
      />
      {text}
    </span>
  );
}
