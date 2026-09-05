"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { flashToast } from "../flash";
import type { WeekHours } from "@/lib/status";

function dollarsToCents(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
}
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
    if (form.get(`openDay_${d}`) == null) {
      out[d] = null;
      continue;
    }
    const open = timeToDecimal(String(form.get(`open_${d}`) ?? ""));
    const close = timeToDecimal(String(form.get(`close_${d}`) ?? ""));
    out[d] = open != null && close != null && close > open ? { open, close } : null;
  }
  return out;
}

export async function updateSettings(form: FormData): Promise<void> {
  await requireAdmin();
  const g = (k: string) => String(form.get(k) ?? "").trim();
  const taxPct = Number.parseFloat(g("taxRatePercent"));

  await db
    .update(settings)
    .set({
      acceptingOrders: form.get("acceptingOrders") != null,
      pausedMessage: g("pausedMessage") || null,
      taxRateBps: Number.isFinite(taxPct) && taxPct >= 0 ? Math.round(taxPct * 100) : 600,
      deliveryPerItemCents: dollarsToCents(g("perItem")),
      deliveryFlatCents: dollarsToCents(g("flat")),
      deliveryFlatMinItems: toInt(g("flatMin"), 5),
      deliveryFreeMinItems: toInt(g("freeMin"), 10),
      hours: parseHours(form),
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));

  await flashToast("Settings saved");
  revalidatePath("/admin/settings");
  revalidatePath("/order");
}
