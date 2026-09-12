"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customBases, customSyrups, customMilks, customToppings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";

// Rows send "1"/"0"; add forms send "1" only when checked.
function on(form: FormData, key: string): boolean {
  return field(form, key) === "1";
}

// ---- Bases: one row per base, offered regular and/or sugar-free ----

export async function createBase(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name");
  if (!name) return;
  const sugarFree = on(form, "sugarFree");
  const regular = on(form, "regular") || !sugarFree; // default to regular if neither
  await db.insert(customBases).values({
    name,
    availableRegular: regular,
    availableSugarFree: sugarFree,
    active: on(form, "active"),
  });
  revalidatePath("/admin/items");
}

export async function updateBase(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const name = field(form, "name");
  if (!id || !name) return;
  await db
    .update(customBases)
    .set({
      name,
      availableRegular: on(form, "regular"),
      availableSugarFree: on(form, "sugarFree"),
      active: on(form, "active"),
      updatedAt: new Date(),
    })
    .where(eq(customBases.id, id));
  revalidatePath("/admin/items");
}

export async function deleteBase(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(customBases).where(eq(customBases.id, id));
  revalidatePath("/admin/items");
}

// ---- Milks (name + active) ----

export async function createMilk(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name");
  if (!name) return;
  await db.insert(customMilks).values({ name, active: on(form, "active") });
  revalidatePath("/admin/items");
}

export async function updateMilk(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const name = field(form, "name");
  if (!id || !name) return;
  await db
    .update(customMilks)
    .set({ name, active: on(form, "active"), updatedAt: new Date() })
    .where(eq(customMilks.id, id));
  revalidatePath("/admin/items");
}

export async function deleteMilk(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(customMilks).where(eq(customMilks.id, id));
  revalidatePath("/admin/items");
}

// ---- Toppings (name + active) ----

export async function createTopping(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name");
  if (!name) return;
  await db.insert(customToppings).values({ name, active: on(form, "active") });
  revalidatePath("/admin/items");
}

export async function updateTopping(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const name = field(form, "name");
  if (!id || !name) return;
  await db
    .update(customToppings)
    .set({ name, active: on(form, "active"), updatedAt: new Date() })
    .where(eq(customToppings.id, id));
  revalidatePath("/admin/items");
}

export async function deleteTopping(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(customToppings).where(eq(customToppings.id, id));
  revalidatePath("/admin/items");
}

// ---- Syrups: one row per flavor, offered regular and/or sugar-free ----

export async function createSyrup(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name");
  if (!name) return;
  // A syrup must be offered in at least one variant; default to regular.
  const sugarFree = on(form, "sugarFree");
  const regular = on(form, "regular") || !sugarFree;
  await db.insert(customSyrups).values({
    name,
    availableRegular: regular,
    availableSugarFree: sugarFree,
    active: on(form, "active"),
  });
  revalidatePath("/admin/items");
}

export async function updateSyrup(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const name = field(form, "name");
  if (!id || !name) return;
  await db
    .update(customSyrups)
    .set({
      name,
      availableRegular: on(form, "regular"),
      availableSugarFree: on(form, "sugarFree"),
      active: on(form, "active"),
      updatedAt: new Date(),
    })
    .where(eq(customSyrups.id, id));
  revalidatePath("/admin/items");
}

export async function deleteSyrup(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(customSyrups).where(eq(customSyrups.id, id));
  revalidatePath("/admin/items");
}
