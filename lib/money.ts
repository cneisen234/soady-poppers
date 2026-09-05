// Money helpers. All amounts in this app are integer cents; these are the one
// place we convert to/from that representation. Pure and safe on client + server.

/** Format integer cents as a dollar string, e.g. 450 -> "$4.50". */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Parse a dollar string (e.g. "4.50") to integer cents. Invalid/negative -> 0. */
export function dollarsToCents(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
}
