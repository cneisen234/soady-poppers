"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vendorDiscounts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";
import { flashToast } from "../flash";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Percent (e.g. "10" or "12.5") -> basis points. Invalid/negative -> 0.
function pctToBps(v: string): number {
  const pct = Number.parseFloat(v);
  return Number.isFinite(pct) && pct >= 0 ? Math.round(pct * 100) : 0;
}

export async function createDiscount(form: FormData): Promise<void> {
  await requireAdmin();
  const email = field(form, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) {
    await flashToast("Enter a valid email");
    return;
  }
  const discountBps = pctToBps(field(form, "ratePercent"));
  // Upsert: re-adding an existing email just updates its rate.
  await db
    .insert(vendorDiscounts)
    .values({ email, discountBps })
    .onConflictDoUpdate({
      target: vendorDiscounts.email,
      set: { discountBps, updatedAt: new Date() },
    });
  await flashToast("Discount saved");
  revalidatePath("/admin/discounts");
}

export async function updateDiscount(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const email = field(form, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return; // ignore blanks / half-typed emails
  await db
    .update(vendorDiscounts)
    .set({ email, discountBps: pctToBps(field(form, "ratePercent")), updatedAt: new Date() })
    .where(eq(vendorDiscounts.id, id));
  // Auto-saved from the row — no toast, no current-page refresh.
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(vendorDiscounts).where(eq(vendorDiscounts.id, id));
  await flashToast("Discount removed");
  revalidatePath("/admin/discounts");
}
