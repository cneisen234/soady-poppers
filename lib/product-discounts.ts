// Kindling's product discounts extension (Pilot Light's
// demo/schema/ecommerce-product-discounts.sql, which specifies the CHECKOUT RULE
// every site must follow exactly):
//  1. Live = active AND starts_at <= now AND (ends_at IS NULL OR now < ends_at).
//  2. A line's candidates target its size (variation), its product, or its category.
//  3. The line gets the ONE candidate that takes the most off (no stacking); ties
//     go to the most specific target (size, then product, then category).
//  4. Off per unit: fixed = min(amount_off_cents, base price); percent =
//     round(base price x discount_bps / 10000). Base price only (custom-drink
//     add-ons stay full price). A price never goes below 0.
//  5-7 live in lib/checkout.ts (recording the line) and the storefront (strike-through).
//
// Used by the catalog (what the storefront shows) and checkout (what's charged),
// so they always agree. Server-only.

import "server-only";
import { and, eq, gt, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { productDiscounts, productDiscountTargets } from "@/lib/db/schema";

export type LiveDiscount = {
  id: string;
  name: string;
  kind: "fixed" | "percent";
  amountOffCents: number | null;
  discountBps: number | null;
  targets: { categoryId: string | null; productId: string | null; variationId: string | null }[];
};

export type AppliedDiscount = { id: string; name: string; offPerUnitCents: number };

/** Discounts live right now, with what each targets. */
export async function loadLiveDiscounts(now = new Date()): Promise<LiveDiscount[]> {
  const rows = await db
    .select({
      id: productDiscounts.id,
      name: productDiscounts.name,
      kind: productDiscounts.kind,
      amountOffCents: productDiscounts.amountOffCents,
      discountBps: productDiscounts.discountBps,
      categoryId: productDiscountTargets.categoryId,
      productId: productDiscountTargets.productId,
      variationId: productDiscountTargets.variationId,
    })
    .from(productDiscounts)
    .innerJoin(productDiscountTargets, eq(productDiscountTargets.discountId, productDiscounts.id))
    .where(
      and(
        eq(productDiscounts.active, true),
        lte(productDiscounts.startsAt, now),
        or(isNull(productDiscounts.endsAt), gt(productDiscounts.endsAt, now)),
      ),
    );
  const byId = new Map<string, LiveDiscount>();
  for (const r of rows) {
    const d = byId.get(r.id) ?? { id: r.id, name: r.name, kind: r.kind, amountOffCents: r.amountOffCents, discountBps: r.discountBps, targets: [] };
    d.targets.push({ categoryId: r.categoryId, productId: r.productId, variationId: r.variationId });
    byId.set(r.id, d);
  }
  return [...byId.values()];
}

/** Rule 4: how much one discount takes off one unit's base price. */
function offPerUnit(d: LiveDiscount, basePriceCents: number): number {
  const off = d.kind === "fixed" ? Math.min(d.amountOffCents ?? 0, basePriceCents) : Math.round((basePriceCents * (d.discountBps ?? 0)) / 10000);
  return Math.max(0, Math.min(off, basePriceCents));
}

/** Rules 2-3: the one discount for this size, or null. */
export function bestDiscount(
  line: { variationId: string; productId: string; categoryId: string | null; basePriceCents: number },
  discounts: LiveDiscount[],
): AppliedDiscount | null {
  let best: { d: LiveDiscount; off: number; specificity: number } | null = null;
  for (const d of discounts) {
    // How specifically this discount targets the line (3 = size, 2 = product, 1 = category).
    const specificity = Math.max(
      0,
      ...d.targets.map((t) =>
        t.variationId === line.variationId ? 3 : t.productId === line.productId ? 2 : line.categoryId && t.categoryId === line.categoryId ? 1 : 0,
      ),
    );
    if (!specificity) continue;
    const off = offPerUnit(d, line.basePriceCents);
    if (off <= 0) continue;
    if (!best || off > best.off || (off === best.off && specificity > best.specificity)) best = { d, off, specificity };
  }
  return best ? { id: best.d.id, name: best.d.name, offPerUnitCents: best.off } : null;
}
