// Coupons — promo codes a customer types at checkout for a percent-off. The
// sibling of lib/discounts.ts, but keyed on a code the customer enters rather
// than their email. Server-only (reads the DB).

import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

/** Normalize a code the way it's stored and matched: trimmed + uppercased. */
export function normalizeCode(code?: string | null): string {
  return (code ?? "").trim().toUpperCase();
}

export type CouponMatch = {
  code: string;
  kind: "percent" | "fixed";
  /** Percent-off in basis points (used when kind = "percent"). */
  bps: number;
  /** Flat amount off in cents (used when kind = "fixed"). */
  amountCents: number;
};

/** The active coupon for a code, or null when the code is blank, unknown, or
 * switched off. Case-insensitive. */
export async function couponForCode(code?: string | null): Promise<CouponMatch | null> {
  const c = normalizeCode(code);
  if (!c) return null;
  const [row] = await db
    .select({
      code: coupons.code,
      kind: coupons.kind,
      bps: coupons.discountBps,
      amountCents: coupons.amountOffCents,
    })
    .from(coupons)
    .where(and(eq(coupons.code, c), eq(coupons.active, true)))
    .limit(1);
  if (!row) return null;
  return { code: row.code, kind: row.kind, bps: row.bps, amountCents: row.amountCents ?? 0 };
}
