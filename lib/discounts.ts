// Vendor discounts — a whitelist of customer emails that get a standing
// percent-off. Server-only (reads the DB).

import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vendorDiscounts } from "@/lib/db/schema";

/** Discount in basis points for a customer email (0 when there's no match or no
 * email). Case-insensitive. */
export async function discountBpsForEmail(email?: string | null): Promise<number> {
  const e = email?.trim().toLowerCase();
  if (!e) return 0;
  const [row] = await db
    .select({ bps: vendorDiscounts.discountBps })
    .from(vendorDiscounts)
    .where(eq(vendorDiscounts.email, e))
    .limit(1);
  return row?.bps ?? 0;
}
