import { hours } from './shop';

// Live open/closed state derived from the hours table. Shared by the header pill
// (OpenStatus) and the hanging storefront sign (OpenSign) so they never disagree.
export type OpenState = {
  open: boolean;
  short: string; // 'Open' | 'Closed'
  headline: string; // 'OPEN' | 'CLOSED'
  script: string; // friendly line, e.g. 'Come on in!' / 'See you tomorrow'
  sub: string; // detail, e.g. 'Open till 8pm' / 'Opens tomorrow 7am'
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtHour(h: number): string {
  const hour = h % 12 || 12;
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${hour}${suffix}`;
}

export function getOpenStatus(now: Date): OpenState {
  const day = now.getDay();
  const decimal = now.getHours() + now.getMinutes() / 60;
  const today = hours[day];

  if (today && decimal >= today.open && decimal < today.close) {
    return {
      open: true,
      short: 'Open',
      headline: 'OPEN',
      script: 'Come on in!',
      sub: `Open till ${fmtHour(today.close)}`,
    };
  }

  // Scan forward for the next day we open (today if it's still before open).
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = hours[d];
    if (!h) continue;
    if (i === 0 && decimal < h.open) {
      return { open: false, short: 'Closed', headline: 'CLOSED', script: 'Opening soon', sub: `Opens ${fmtHour(h.open)}` };
    }
    if (i > 0) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
      return {
        open: false,
        short: 'Closed',
        headline: 'CLOSED',
        script: i === 1 ? 'See you tomorrow' : 'See you soon',
        sub: `Opens ${when} ${fmtHour(h.open)}`,
      };
    }
  }
  return { open: false, short: 'Closed', headline: 'CLOSED', script: 'See you soon', sub: '' };
}
