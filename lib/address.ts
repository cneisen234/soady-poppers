// Delivery-address formatting.

export type Address = {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
};

/** One-line delivery address: "line1[, line2], city, state zip". */
export function formatAddress(a: Address): string {
  return `${a.line1}${a.line2 ? `, ${a.line2}` : ""}, ${a.city}, ${a.state} ${a.zip}`;
}
