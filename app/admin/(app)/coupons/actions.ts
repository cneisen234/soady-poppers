"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";
import { flashToast } from "../flash";
import { CODE_RE } from "./constants";

// Percent (e.g. "10" or "12.5") -> basis points. Invalid/negative -> 0.
function pctToBps(v: string): number {
  const pct = Number.parseFloat(v);
  return Number.isFinite(pct) && pct >= 0 ? Math.round(pct * 100) : 0;
}

// Dollars (e.g. "2.50") -> cents. Invalid/negative -> 0.
function dollarsToCents(v: string): number {
  const dollars = Number.parseFloat(v);
  return Number.isFinite(dollars) && dollars >= 0 ? Math.round(dollars * 100) : 0;
}

// Codes are stored uppercased; the checkout matches case-insensitively.
function normCode(v: string): string {
  return v.trim().toUpperCase();
}

// Active flag — rows send "1"/"0"; the add form sends "1" only when checked.
function isActive(form: FormData): boolean {
  return field(form, "active") === "1";
}

// The percent/fixed columns to write for a form's chosen kind. Returns null when
// the amount is missing/invalid so the caller can reject it.
function discountValues(
  form: FormData,
): { kind: "percent" | "fixed"; discountBps: number; amountOffCents: number | null } | null {
  const kind = field(form, "kind") === "fixed" ? "fixed" : "percent";
  if (kind === "fixed") {
    const amountOffCents = dollarsToCents(field(form, "amountDollars"));
    if (amountOffCents <= 0) return null;
    return { kind, discountBps: 0, amountOffCents };
  }
  const discountBps = pctToBps(field(form, "ratePercent"));
  if (discountBps <= 0) return null;
  return { kind, discountBps, amountOffCents: null };
}

export async function createCoupon(form: FormData): Promise<void> {
  await requireAdmin();
  const code = normCode(field(form, "code"));
  if (!CODE_RE.test(code)) {
    await flashToast("Enter a valid code (letters, numbers, dashes)");
    return;
  }
  const discount = discountValues(form);
  if (!discount) {
    await flashToast("Enter a discount amount");
    return;
  }
  // Upsert: re-adding an existing code just updates its discount + active state.
  await db
    .insert(coupons)
    .values({ code, active: isActive(form), ...discount })
    .onConflictDoUpdate({
      target: coupons.code,
      set: { active: isActive(form), ...discount, updatedAt: new Date() },
    });
  await flashToast("Coupon saved");
  revalidatePath("/admin/orders");
}

export async function updateCoupon(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const code = normCode(field(form, "code"));
  if (!CODE_RE.test(code)) return; // ignore blanks / half-typed codes
  const discount = discountValues(form);
  if (!discount) return; // ignore a half-typed amount mid-edit
  await db
    .update(coupons)
    .set({ code, active: isActive(form), ...discount, updatedAt: new Date() })
    .where(eq(coupons.id, id));
  // Auto-saved from the row — no toast, no current-page refresh.
  revalidatePath("/admin/orders");
}

export async function deleteCoupon(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(coupons).where(eq(coupons.id, id));
  await flashToast("Coupon removed");
  revalidatePath("/admin/orders");
}
