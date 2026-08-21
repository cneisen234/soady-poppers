'use client';

import { useEffect, useState } from 'react';
import { hours } from '@/lib/shop';

type Status = { open: boolean; label: string };

function computeStatus(now: Date): Status {
  const day = now.getDay();
  const decimal = now.getHours() + now.getMinutes() / 60;
  const today = hours[day];

  if (today && decimal >= today.open && decimal < today.close) {
    const closeHour = today.close % 12 || 12;
    const suffix = today.close >= 12 ? 'pm' : 'am';
    return { open: true, label: `Open till ${closeHour}${suffix}` };
  }

  // Find the next opening day (today-if-earlier, else scan forward up to a week)
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = hours[d];
    if (!h) continue;
    if (i === 0 && decimal < h.open) {
      const openHour = h.open % 12 || 12;
      const suffix = h.open >= 12 ? 'pm' : 'am';
      return { open: false, label: `Opens ${openHour}${suffix}` };
    }
    if (i > 0) {
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const openHour = h.open % 12 || 12;
      const suffix = h.open >= 12 ? 'pm' : 'am';
      const when = i === 1 ? 'tomorrow' : names[d];
      return { open: false, label: `Opens ${when} ${openHour}${suffix}` };
    }
  }
  return { open: false, label: 'Closed' };
}

export default function OpenStatus({ className = '' }: { className?: string }) {
  // Render a stable placeholder on the server, then hydrate with the live value
  // to avoid a hydration mismatch from the clock.
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(computeStatus(new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const open = status?.open ?? false;
  const label = status?.label ?? 'Hours';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${className}`}>
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: open ? 'var(--leaf)' : 'var(--pink-deep)',
          boxShadow: open ? '0 0 0 3px rgba(78,158,126,0.2)' : '0 0 0 3px rgba(216,91,132,0.18)',
        }}
        aria-hidden="true"
      />
      <span style={{ color: open ? 'var(--pine)' : 'var(--pink-deep)' }}>
        {status ? label : ' '}
      </span>
    </span>
  );
}
