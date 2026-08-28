// ---------------------------------------------------------------------------
// Big Poppa's graffiti toolkit — hand-drawn SVG street-art elements shared by
// the /big-poppas page and the branded Big Poppa's teaser bands on the home +
// menu pages. Everything here is decorative + server-safe (no hooks, no client
// JS): spray-paint drips, wet splatter, spray arrows, taped photos and hip-hop
// motifs (cassette, crown), plus the `vars` helper for setting --bp-* CSS
// custom properties (these React types have no `--${string}` index signature).
// ---------------------------------------------------------------------------
import type { CSSProperties, ReactNode } from 'react';

type Deco = { className?: string; style?: CSSProperties; color?: string };

/** Build a style object carrying CSS custom properties (--bp-*), cast once. */
export function vars(v: Record<string, string>): CSSProperties {
  return v as CSSProperties;
}

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
  height = 88,
}: Deco & { height?: number }) {
  // Stable, unique-per-color pattern id (multiple Drips render on one page).
  const id = `bpdrip-${color.replace(/[^a-z0-9]/gi, '')}`;
  const BAND = 11; // thickness of the pooled paint edge

  // One ~300px tile of drips with wildly uneven lengths — a few short nubs,
  // a couple of long thin runs that streak way down (like the coaster).
  const drips = [
    { x: 16, w: 20, len: 24 },
    { x: 50, w: 11, len: 58 },
    { x: 84, w: 26, len: 18 },
    { x: 120, w: 14, len: 40 },
    { x: 150, w: 9, len: 68 },
    { x: 178, w: 24, len: 28 },
    { x: 214, w: 12, len: 48 },
    { x: 246, w: 20, len: 20 },
    { x: 276, w: 13, len: 54 },
  ];
  // Bumps that make the pooled top edge blobby instead of a ruler-straight line.
  const bumps = [
    { cx: 40, cy: BAND, r: 7 },
    { cx: 110, cy: BAND + 1, r: 6 },
    { cx: 200, cy: BAND, r: 8 },
    { cx: 265, cy: BAND + 1, r: 6 },
  ];
  // Loose overspray — scattered specks flung off the can, all over the tile.
  const specks = [
    { cx: 34, cy: 40, r: 3 }, { cx: 68, cy: 80, r: 4.5 }, { cx: 100, cy: 52, r: 2.5 },
    { cx: 134, cy: 70, r: 3.5 }, { cx: 165, cy: 84, r: 3 }, { cx: 196, cy: 58, r: 2.5 },
    { cx: 230, cy: 78, r: 4 }, { cx: 262, cy: 46, r: 2.5 }, { cx: 290, cy: 66, r: 3 },
    { cx: 12, cy: 62, r: 2 }, { cx: 118, cy: 86, r: 2 }, { cx: 208, cy: 34, r: 2 },
    { cx: 300, cy: 30, r: 2.5 }, { cx: 0, cy: 44, r: 2.5 },
  ];

  return (
    <svg
      width="100%"
      height={height}
      className={className}
      style={{ display: 'block', filter: `drop-shadow(0 2px 7px ${color})`, ...style }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="300" height={height}>
          <g fill={color}>
            <rect x="0" y="0" width="300" height={BAND} />
            {bumps.map((b, i) => (
              <circle key={`b${i}`} cx={b.cx} cy={b.cy} r={b.r} />
            ))}
            {drips.map((d, i) => {
              const tipR = Math.max((d.w / 2) * 1.15, 5);
              return (
                <g key={`d${i}`}>
                  <rect x={d.x} y="0" width={d.w} height={BAND + d.len} rx={d.w / 2} />
                  <circle cx={d.x + d.w / 2} cy={BAND + d.len} r={tipR} />
                </g>
              );
            })}
            {specks.map((s, i) => (
              <circle key={`s${i}`} cx={s.cx} cy={s.cy} r={s.r} />
            ))}
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

/** A strip of translucent packing tape for taped-up photos (internal helper). */
function Tape({ className = '', style }: { className?: string; style?: CSSProperties }) {
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
