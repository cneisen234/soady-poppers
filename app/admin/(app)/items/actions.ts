"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { products, variations, productImages, categories } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { dollarsToCents } from "@/lib/money";
import { field, bool } from "@/lib/form";
import type { ProductRecipe } from "@/lib/custom-drink-types";
import { flashToast } from "../flash";

// The recipe pickers post each list as a JSON array of ids. The base comes from
// the category, so a recipe is just flavors + toppings; no included flavor =>
// null recipe (item isn't customizable).
function parseRecipe(form: FormData): ProductRecipe | null {
  const ids = (key: string): string[] => {
    try {
      const a = JSON.parse(field(form, key) || "[]");
      return Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  };
  const syrupIds = ids("recipeSyrups");
  if (syrupIds.length === 0) return null;
  return { syrupIds, toppingIds: ids("recipeToppings") };
}

const utapi = new UTApi();

// ---- helpers ----

// null = inherit global rate, 0 = exempt, else custom rate in basis points.
function taxBps(form: FormData): number | null {
  const mode = field(form, "taxMode") || "inherit";
  if (mode === "inherit") return null;
  if (mode === "exempt") return 0;
  const pct = Number.parseFloat(field(form, "taxRatePercent"));
  return Number.isFinite(pct) && pct >= 0 ? Math.round(pct * 100) : 0;
}

// ---- products ----

export async function createProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name") || "Untitled item";
  const categoryId = field(form, "categoryId") || null;
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(products);
  const [row] = await db
    .insert(products)
    .values({ name, categoryId, sort: c })
    .returning({ id: products.id });
  await flashToast("Item created");
  redirect(`/admin/items/${row.id}`);
}

export async function updateProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db
    .update(products)
    .set({
      name: field(form, "name") || "Untitled item",
      description: field(form, "description") || null,
      categoryId: field(form, "categoryId") || null,
      available: bool(form, "available"),
      hidden: !bool(form, "visible"),
      taxRateBps: taxBps(form),
      trackInventory: bool(form, "trackInventory"),
      stock: Math.max(0, Number.parseInt(field(form, "stock"), 10) || 0),
      recipe: parseRecipe(form),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
  // Auto-saved from the editor — no toast, and don't refresh the current page
  // (the client already holds the values). Just mark the list stale.
  revalidatePath("/admin/items");
}

export async function deleteProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  // Clean up any uploaded images from UploadThing (seeded Square images have no key).
  const imgs = await db
    .select({ utKey: productImages.utKey })
    .from(productImages)
    .where(eq(productImages.productId, id));
  const keys = imgs.map((i) => i.utKey).filter((k): k is string => !!k);
  if (keys.length) await utapi.deleteFiles(keys).catch(() => {});
  await db.delete(products).where(eq(products.id, id)); // cascades variations + images
  await flashToast("Item deleted");
  revalidatePath("/admin/items");
  redirect("/admin/items");
}

// ---- variations ----

export async function saveVariation(form: FormData): Promise<void> {
  await requireAdmin();
  const productId = field(form, "productId");
  if (!productId) return;
  const id = field(form, "id");
  const base = {
    name: field(form, "name") || "Regular",
    priceCents: dollarsToCents(field(form, "price")),
    sku: field(form, "sku") || null,
  };
  if (id) {
    // Auto-saved edit of an existing size — no toast, no current-page refresh.
    await db
      .update(variations)
      .set({
        ...base,
        available: bool(form, "available"),
        soldOut: bool(form, "soldOut"),
        updatedAt: new Date(),
      })
      .where(eq(variations.id, id));
    revalidatePath("/admin/items");
  } else {
    // New size appends after the existing ones and is available by default.
    const [{ c }] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(variations)
      .where(eq(variations.productId, productId));
    await db.insert(variations).values({ ...base, productId, available: true, sort: c });
    await flashToast("Size added");
    revalidatePath(`/admin/items/${productId}`);
    revalidatePath("/admin/items");
  }
}

export async function deleteVariation(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const productId = field(form, "productId");
  if (!id) return;
  await db.delete(variations).where(eq(variations.id, id));
  await flashToast("Size deleted");
  revalidatePath(`/admin/items/${productId}`);
}

// ---- images ----

export async function addProductImage(input: {
  productId: string;
  url: string;
  key: string;
}): Promise<void> {
  await requireAdmin();
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productImages)
    .where(eq(productImages.productId, input.productId));
  await db.insert(productImages).values({
    productId: input.productId,
    url: input.url,
    utKey: input.key,
    sort: c,
  });
  await flashToast("Photo added");
  revalidatePath(`/admin/items/${input.productId}`);
}

export async function deleteProductImage(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const productId = field(form, "productId");
  if (!id) return;
  const [img] = await db
    .select({ utKey: productImages.utKey })
    .from(productImages)
    .where(eq(productImages.id, id));
  if (img?.utKey) await utapi.deleteFiles([img.utKey]).catch(() => {});
  await db.delete(productImages).where(eq(productImages.id, id));
  await flashToast("Photo removed");
  revalidatePath(`/admin/items/${productId}`);
}

export async function makePrimaryImage(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const productId = field(form, "productId");
  if (!id || !productId) return;
  // Lowest sort wins (storefront uses images[0]); put this one below the current min.
  const [{ min }] = await db
    .select({ min: sql<number>`coalesce(min(${productImages.sort}), 0)::int` })
    .from(productImages)
    .where(eq(productImages.productId, productId));
  await db.update(productImages).set({ sort: min - 1 }).where(eq(productImages.id, id));
  await flashToast("Primary photo updated");
  revalidatePath(`/admin/items/${productId}`);
}

// ---- categories ----

export async function createCategory(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name");
  if (!name) return;
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(categories);
  await db.insert(categories).values({ name, sort: c });
  await flashToast("Category added");
  revalidatePath("/admin/items/categories");
  revalidatePath("/admin/items");
}

export async function renameCategory(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const name = field(form, "name");
  if (!id || !name) return;
  await db
    .update(categories)
    .set({ name, updatedAt: new Date() })
    .where(eq(categories.id, id));
  // Auto-saved rename — no toast, no current-page refresh. Keep the item list
  // fresh since it shows category names.
  revalidatePath("/admin/items");
}

export async function deleteCategory(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(categories).where(eq(categories.id, id)); // products.category_id -> null
  await flashToast("Category deleted");
  revalidatePath("/admin/items/categories");
  revalidatePath("/admin/items");
}
