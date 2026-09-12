"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";
import { dollarsToCents } from "@/lib/money";

function toInt(v: string, fallback: number): number {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// The custom-drink add-on pricing lives on the settings row, but is edited here
// (Items → Custom Drink) rather than in the main Settings form.
export async function updateCustomPricing(form: FormData): Promise<void> {
  await requireAdmin();
  await db
    .update(settings)
    .set({
      customFreeSyrups: toInt(field(form, "freeSyrups"), 2),
      customMaxSyrups: Math.max(1, toInt(field(form, "maxSyrups"), 5)),
      addonSyrupCents: dollarsToCents(field(form, "syrupPrice")),
      addonCaffeineCents: dollarsToCents(field(form, "caffeinePrice")),
      addonElectrolyteCents: dollarsToCents(field(form, "electrolytePrice")),
      addonMilkCents: dollarsToCents(field(form, "milkPrice")),
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));
  revalidatePath("/admin/items");
}
