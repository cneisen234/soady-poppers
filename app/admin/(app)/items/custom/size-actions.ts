"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { variations } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";
import { dollarsToCents } from "@/lib/money";
import { CUSTOM_PRODUCT_ID } from "@/lib/custom-drink";

// Sizes are the custom product's variations, so all writes are scoped to it.

export async function createSize(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name");
  if (!name) return;
  await db.insert(variations).values({
    productId: CUSTOM_PRODUCT_ID,
    name,
    priceCents: dollarsToCents(field(form, "price")),
  });
  revalidatePath("/admin/items");
}

export async function updateSize(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const name = field(form, "name");
  if (!id || !name) return;
  await db
    .update(variations)
    .set({ name, priceCents: dollarsToCents(field(form, "price")), updatedAt: new Date() })
    .where(and(eq(variations.id, id), eq(variations.productId, CUSTOM_PRODUCT_ID)));
  revalidatePath("/admin/items");
}

export async function deleteSize(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db
    .delete(variations)
    .where(and(eq(variations.id, id), eq(variations.productId, CUSTOM_PRODUCT_ID)));
  revalidatePath("/admin/items");
}
