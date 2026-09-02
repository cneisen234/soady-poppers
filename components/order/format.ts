// Shared money formatter for client components (server uses lib/catalog.ts).
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
