// Percent options offered in the admin (5, 10, 15 … 100) — shared with the
// vendor-discount panel, since a coupon is the same percent-off idea.
export { PERCENT_OPTIONS } from "../discounts/constants";

// A code is uppercased, 2–32 chars, letters/digits/dashes (no spaces).
export const CODE_RE = /^[A-Z0-9-]{2,32}$/;
