"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { dollarsToCents } from "@/lib/money";
import { field, bool } from "@/lib/form";
import type { WeekHours } from "@/lib/status";

function toInt(v: string, fallback: number): number {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
function timeToDecimal(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h + min / 60;
}
function parseHours(form: FormData): WeekHours {
  const out: WeekHours = {};
  for (let d = 0; d < 7; d++) {
    // Switch ON = open that day; off = closed.
    if (!bool(form, `openDay_${d}`)) {
      out[d] = null;
      continue;
    }
    const open = timeToDecimal(field(form, `open_${d}`));
    const close = timeToDecimal(field(form, `close_${d}`));
    out[d] = open != null && close != null && close > open ? { open, close } : null;
  }
  return out;
}

export async function updateSettings(form: FormData): Promise<void> {
  await requireAdmin();
  const taxPct = Number.parseFloat(field(form, "taxRatePercent"));

  await db
    .update(settings)
    .set({
      acceptingOrders: bool(form, "acceptingOrders"),
      pausedMessage: field(form, "pausedMessage") || null,
      taxRateBps: Number.isFinite(taxPct) && taxPct >= 0 ? Math.round(taxPct * 100) : 600,
      deliveryPerItemCents: dollarsToCents(field(form, "perItem")),
      deliveryFlatCents: dollarsToCents(field(form, "flat")),
      deliveryFlatMinItems: toInt(field(form, "flatMin"), 5),
      deliveryFreeMinItems: toInt(field(form, "freeMin"), 10),
      hours: parseHours(form),
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));

  // Auto-saved — no toast, and don't revalidate the current page (the client
  // holds the live values). Refresh the storefront so pause/hours/fees apply.
  revalidatePath("/order");
}
