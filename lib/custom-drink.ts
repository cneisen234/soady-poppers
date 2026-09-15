// The single, always-present Custom Drink product. Its sizes are ordinary
// `variations` rows — reusing the same sizing/pricing path as any drink. Managed
// in Settings → Custom Drink, and surfaced on the storefront as the wizard.
// Server-only (reads the DB).

import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  variations,
  customBases,
  customSyrups,
  customMilks,
  customToppings,
  products,
  categories,
} from "@/lib/db/schema";
import { getSettings } from "@/lib/settings";
import type { CustomSize, CustomVariant, CustomDrinkData } from "@/lib/custom-drink-types";

// Fixed id, seeded in 0010_seed_custom_drink_product — so nothing looks it up by name.
export const CUSTOM_PRODUCT_ID = "00000000-0000-0000-0000-0000000000cd";

/** The custom drink's sizes (its variations), in display order. */
export async function getCustomSizes(): Promise<CustomSize[]> {
  const rows = await db
    .select({ id: variations.id, name: variations.name, priceCents: variations.priceCents })
    .from(variations)
    .where(eq(variations.productId, CUSTOM_PRODUCT_ID))
    .orderBy(asc(variations.sort), asc(variations.name));
  return rows;
}

// A predefined item's recipe context, used to re-price a "Customize this drink"
// build server-side: the free-flavor threshold and the bases its category allows.
export type RecipeContext = {
  freeSyrups: number;
  baseIds: string[];
};

/** Load recipe contexts for the given product ids (customized predefined items).
 * The free-flavor threshold is that item's included-flavor count; the allowed
 * bases come from its category. Products without a recipe are omitted. */
export async function getRecipeContexts(
  productIds: string[],
): Promise<Map<string, RecipeContext>> {
  const ids = [...new Set(productIds)].filter(Boolean);
  const out = new Map<string, RecipeContext>();
  if (ids.length === 0) return out;
  const rows = await db
    .select({
      id: products.id,
      recipe: products.recipe,
      productBaseIds: products.baseIds,
      catBaseIds: categories.baseIds,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.id, ids));
  for (const r of rows) {
    if (!r.recipe) continue;
    // The item's own base(s) win over the category's.
    const baseIds =
      r.productBaseIds && r.productBaseIds.length ? r.productBaseIds : r.catBaseIds ?? [];
    out.set(r.id, {
      freeSyrups: r.recipe.syrupIds.length,
      baseIds,
    });
  }

  // A sugar-free build swaps to the base's counterpart (Coke → Coke Zero), so the
  // counterpart is an allowed base too. Add each allowed base's sugar-free id.
  const allowed = [...new Set([...out.values()].flatMap((c) => c.baseIds))];
  if (allowed.length) {
    const cp = await db
      .select({ id: customBases.id, sugarFreeId: customBases.sugarFreeId })
      .from(customBases)
      .where(inArray(customBases.id, allowed));
    const bySf = new Map(cp.map((b) => [b.id, b.sugarFreeId]));
    for (const c of out.values()) {
      const extra = c.baseIds
        .map((id) => bySf.get(id))
        .filter((x): x is string => !!x);
      if (extra.length) c.baseIds = [...new Set([...c.baseIds, ...extra])];
    }
  }
  return out;
}

/** Everything the storefront wizard needs. Returns null when the builder can't be
 * offered (no sellable sizes, or no active bases). */
export async function getCustomDrink(): Promise<CustomDrinkData | null> {
  const [product, bases, syrups, toppings, milks, settings] = await Promise.all([
    db.query.products.findFirst({
      where: (p, { eq: e, and: a }) => a(e(p.isCustom, true), e(p.available, true), e(p.hidden, false)),
      with: { variations: { orderBy: (v, { asc: as }) => [as(v.sort), as(v.name)] } },
    }),
    db.select().from(customBases).where(eq(customBases.active, true)).orderBy(asc(customBases.name)),
    db.select().from(customSyrups).where(eq(customSyrups.active, true)).orderBy(asc(customSyrups.name)),
    db.select().from(customToppings).where(eq(customToppings.active, true)).orderBy(asc(customToppings.name)),
    db.select().from(customMilks).where(eq(customMilks.active, true)).orderBy(asc(customMilks.name)),
    getSettings(),
  ]);

  const sizes = (product?.variations ?? [])
    .filter((v) => v.available && !v.soldOut)
    .map((v) => ({ id: v.id, name: v.name, priceCents: v.priceCents }));

  if (!product || sizes.length === 0 || bases.length === 0) return null;

  const variant = (r: {
    id: string;
    name: string;
    availableRegular: boolean;
    availableSugarFree: boolean;
  }): CustomVariant => ({
    id: r.id,
    name: r.name,
    availableRegular: r.availableRegular,
    availableSugarFree: r.availableSugarFree,
  });

  return {
    sizes,
    bases: bases.map((b) => ({ ...variant(b), sugarFreeId: b.sugarFreeId })),
    syrups: syrups.map(variant),
    toppings: toppings.map((t) => ({
      id: t.id,
      name: t.name,
      availableRegular: t.availableRegular,
      availableSugarFree: t.availableSugarFree,
    })),
    milks: milks.map((m) => ({ id: m.id, name: m.name })),
    pricing: {
      freeSyrups: settings.customFreeSyrups,
      maxSyrups: settings.customMaxSyrups,
      syrupCents: settings.addonSyrupCents,
      caffeineCents: settings.addonCaffeineCents,
      electrolyteCents: settings.addonElectrolyteCents,
      milkCents: settings.addonMilkCents,
    },
  };
}
