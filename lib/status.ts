// Live open/closed state + hours formatting, derived from a week's hours table.
// Pure and client-safe (no DB / server-only imports): callers pass the hours in,
// so the same logic runs on the server and in the live client pills.

export type DayHours = { open: number; close: number } | null; // decimal hours, 24h
export type WeekHours = Record<number, DayHours>; // 0 = Sunday … 6 = Saturday

// Sensible defaults (the shop's standard week) used when settings has none.
export const DEFAULT_HOURS: WeekHours = {
  0: null,
  1: { open: 7, close: 17 },
  2: { open: 7, close: 17 },
  3: { open: 7, close: 17 },
  4: { open: 7, close: 17 },
  5: { open: 7, close: 20 },
  6: { open: 10, close: 20 },
};

export type OpenState = {
  open: boolean;
  short: string; // 'Open' | 'Closed'
  headline: string; // 'OPEN' | 'CLOSED'
  script: string; // friendly line
  sub: string; // detail, e.g. 'Open till 8pm' / 'Opens tomorrow 7am'
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function fmtHour(h: number): string {
  const hour = Math.floor(h) % 12 || 12;
  const mins = Math.round((h - Math.floor(h)) * 60);
  const suffix = h >= 12 ? "pm" : "am";
  return mins ? `${hour}:${String(mins).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

function fmtHour12(h: number): string {
  const hour = Math.floor(h) % 12 || 12;
  const mins = Math.round((h - Math.floor(h)) * 60);
  const ap = h >= 12 ? "PM" : "AM";
  return mins ? `${hour}:${String(mins).padStart(2, "0")} ${ap}` : `${hour} ${ap}`;
}

export function getOpenStatus(now: Date, hours: WeekHours = DEFAULT_HOURS): OpenState {
  const day = now.getDay();
  const decimal = now.getHours() + now.getMinutes() / 60;
  const today = hours[day];

  if (today && decimal >= today.open && decimal < today.close) {
    return {
      open: true,
      short: "Open",
      headline: "OPEN",
      script: "Come on in!",
      sub: `Open till ${fmtHour(today.close)}`,
    };
  }

  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = hours[d];
    if (!h) continue;
    if (i === 0 && decimal < h.open) {
      return { open: false, short: "Closed", headline: "CLOSED", script: "Opening soon", sub: `Opens ${fmtHour(h.open)}` };
    }
    if (i > 0) {
      const when = i === 1 ? "tomorrow" : DAY_NAMES[d];
      return {
        open: false,
        short: "Closed",
        headline: "CLOSED",
        script: i === 1 ? "See you tomorrow" : "See you soon",
        sub: `Opens ${when} ${fmtHour(h.open)}`,
      };
    }
  }
  return { open: false, short: "Closed", headline: "CLOSED", script: "See you soon", sub: "" };
}

export type HoursRow = { label: string; value: string; closed?: boolean };

/** Human-readable Monday-first hours list for the footer / visit page. */
export function formatHours(hours: WeekHours = DEFAULT_HOURS): HoursRow[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((d) => {
    const h = hours[d];
    return h
      ? { label: FULL_DAY_NAMES[d], value: `${fmtHour12(h.open)} – ${fmtHour12(h.close)}` }
      : { label: FULL_DAY_NAMES[d], value: "Closed", closed: true };
  });
}
