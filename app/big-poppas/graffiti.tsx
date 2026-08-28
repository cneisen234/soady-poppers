// ---------------------------------------------------------------------------
// Big Poppa's graffiti toolkit — hand-drawn SVG street-art elements used only
// on the /big-poppas page. Everything here is decorative + server-safe (no
// hooks, no client JS): spray-paint drips, wet splatter, marker tags, taped
// stickers and hip-hop motifs (cassette, crown). Keeps the page component
// readable while giving it a real graffiti-wall feel instead of a clean sign.
// ---------------------------------------------------------------------------
import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';

type Deco = { className?: string; style?: CSSProperties; color?: string };

/**
 * A ragged edge of wet paint dripping down — the signature graffiti touch.
 * Sits at the top of a section like paint that ran down the wall onto it.
 *
 * Built as a fixed-height SVG <pattern> tiled in user-space pixels, so the
 * drips stay a constant, modest size at ANY viewport width — they never
 * balloon on wide desktops. Tune `height` to make them taller/shorter.
 */
export function Drips({
  className = '',
  style,
  color = 'var(--bp-pink)',
  height = 60,
}: Deco & { height?: number }) {
  // Stable, unique-per-color pattern id (multiple Drips render on one page).
  const id = `bpdrip-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg
      width="100%"
      height={height}
      className={className}
      style={{ display: 'block', filter: `drop-shadow(0 2px 8px ${color})`, ...style }}
      aria-hidden="true"
    >
      <defs>
        {/* one ~196px-wide tile of three varied drips + stray droplets */}
        <pattern id={id} patternUnits="userSpaceOnUse" width="196" height={height}>
          <g fill={color}>
            <rect x="0" y="0" width="196" height="12" />
            <rect x="18" y="0" width="22" height="44" rx="11" />
            <circle cx="29" cy="44" r="12.5" />
            <rect x="80" y="0" width="13" height="23" rx="6.5" />
            <circle cx="86.5" cy="23" r="7.5" />
            <rect x="134" y="0" width="26" height="32" rx="13" />
            <circle cx="147" cy="32" r="14.5" />
            <circle cx="60" cy="38" r="4" />
            <circle cx="178" cy="28" r="3" />
          </g>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height={height} fill={`url(#${id})`} />
    </svg>
  );
}

/** A wet paint splatter — a wobbly central blob flung with satellite specks. */
export function Splat({ className = '', style, color = 'var(--bp-pink)' }: Deco) {
  const specks = [
    { cx: 158, cy: 60, r: 13 },
    { cx: 60, cy: 150, r: 10 },
    { cx: 172, cy: 138, r: 8 },
    { cx: 40, cy: 78, r: 8 },
    { cx: 120, cy: 34, r: 7 },
    { cx: 186, cy: 96, r: 5 },
    { cx: 74, cy: 36, r: 5 },
    { cx: 150, cy: 176, r: 5 },
    { cx: 26, cy: 116, r: 4 },
    { cx: 192, cy: 52, r: 3 },
    { cx: 96, cy: 188, r: 3 },
  ];
  return (
    <svg viewBox="0 0 210 210" className={className} style={style} aria-hidden="true">
      <g fill={color}>
        <path d="M104 44c22-6 52 4 55 40 3 30-14 66-48 66-30 0-62-12-64-50-2-34 35-50 57-56z" />
        {/* a couple of drip tendrils off the main blob */}
        <path d="M150 96c6 14 4 30-2 40-4-10-6-26 2-40z" />
        <path d="M70 132c-8 10-10 24-8 34 8-8 12-22 8-34z" />
        {specks.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} />
        ))}
      </g>
    </svg>
  );
}

/** A loose, hand-tagged marker circle to lasso a word — two sketchy passes. */
export function MarkerCircle({ className = '', style, color = 'var(--bp-lime)' }: Deco) {
  return (
    <svg viewBox="0 0 320 150" className={className} style={style} aria-hidden="true" fill="none">
      <path
        d="M162 14C74 8 26 38 22 74c-4 40 66 64 148 62 78-2 126-30 124-66-3-34-70-54-140-56"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M300 68c4 22-40 46-104 52"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** A spray-can arrow — curved shaft with a fat graffiti head, points at CTAs. */
export function SprayArrow({ className = '', style, color = 'var(--bp-cyan)' }: Deco) {
  return (
    <svg viewBox="0 0 170 130" className={className} style={style} aria-hidden="true" fill="none">
      <path d="M12 42C52 8 116 6 138 66" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <path d="M138 66l-30-2M138 66l-2-30" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A 4-point graffiti "shine" sparkle. */
export function Star({ className = '', style, color = 'var(--bp-cyan)' }: Deco) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path
        d="M50 4c6 32 14 40 46 46-32 6-40 14-46 46-6-32-14-40-46-46 32-6 40-14 46-46z"
        fill={color}
      />
    </svg>
  );
}

/** A little cassette tape — the hip-hop / boombox-wall nod. */
export function Cassette({ className = '', style, color = 'var(--bp-bone)' }: Deco) {
  return (
    <svg viewBox="0 0 120 80" className={className} style={style} aria-hidden="true" fill="none">
      <rect x="3" y="3" width="114" height="74" rx="10" stroke={color} strokeWidth="4" />
      <rect x="20" y="18" width="80" height="26" rx="5" stroke={color} strokeWidth="3" />
      <circle cx="40" cy="31" r="7" stroke={color} strokeWidth="3" />
      <circle cx="80" cy="31" r="7" stroke={color} strokeWidth="3" />
      <path d="M33 31h4M83 31h4" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 60h60" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** A fat 3-point crown — the Elite Eats / "king" motif. */
export function Crown({ className = '', style, color = 'var(--bp-gold)' }: Deco) {
  return (
    <svg viewBox="0 0 120 84" className={className} style={style} aria-hidden="true">
      <path
        d="M8 74l-6-54 34 26L60 8l24 38 34-26-6 54z"
        fill={color}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="2" cy="20" r="6" fill={color} />
      <circle cx="118" cy="20" r="6" fill={color} />
      <circle cx="60" cy="8" r="6" fill={color} />
    </svg>
  );
}

/**
 * A slapped sticker — an image trimmed with a chunky white border, tossed on
 * at an angle with two strips of tape. The sticker-bomb / wheatpaste look.
 */
export function Sticker({
  src,
  alt,
  width,
  height,
  rotate = -6,
  className = '',
  style,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <Tape className="left-3 -top-2 -rotate-12" />
      <Tape className="right-4 -bottom-2 rotate-6" />
      <div
        className="relative overflow-hidden"
        style={{
          border: '5px solid var(--bp-bone)',
          borderRadius: '10px',
          boxShadow: '0 16px 34px -12px rgba(0,0,0,0.7)',
        }}
      >
        <Image src={src} alt={alt} width={width} height={height} className="block h-auto w-full object-cover" />
      </div>
    </div>
  );
}

/** A strip of translucent packing tape for stickers + taped-up photos. */
export function Tape({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`absolute z-10 ${className}`}
      aria-hidden="true"
      style={{
        width: '70px',
        height: '24px',
        background:
          'linear-gradient(180deg, rgba(244,238,205,0.62), rgba(224,216,170,0.5))',
        boxShadow: '0 1px 5px rgba(0,0,0,0.35)',
        borderLeft: '1px solid rgba(255,255,255,0.35)',
        borderRight: '1px solid rgba(0,0,0,0.15)',
        ...style,
      }}
    />
  );
}

/** Wraps a photo so it reads like a flyer taped to the brick wall. */
export function TapedPhoto({
  children,
  rotate = 0,
  className = '',
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <Tape className="left-1/2 -top-2.5 -translate-x-1/2 -rotate-3" />
      {children}
    </div>
  );
}
