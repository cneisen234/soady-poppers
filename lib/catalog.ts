// Read path for the storefront catalog — sourced from OUR Postgres database.
//
// Returns a flat Catalog shape the storefront and checkout consume. The catalog
// is loaded from scripts/menu-data.ts via `npm run db:menu` (scripts/import-menu).
//
// Server-only (imports lib/db).

import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import type { ProductRecipe } from "@/lib/custom-drink-types";

export type ProductVariation = {
  id: string;
  name: string;
  priceCents: number;
  priceLabel: string;
  /** False when this size is marked sold out or unavailable. */
  available: boolean;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  /** False when the item is paused or every variation is unavailable. */
  available: boolean;
  variations: ProductVariation[];
  /** Set when this item can be customized (included flavors + toppings). The base
   * is inherited from the category — see the matching category's baseIds. */
  recipe?: ProductRecipe;
};

export type Catalog = {
  /** baseIds are the customizable bases the category allows (from custom_bases). */
  categories: { id: string; name: string; baseIds: string[] }[];
  products: Product[];
};

/**
 * Fetch the storefront catalog from Postgres, normalized into the flat shape the
 * UI consumes. Hidden products are excluded entirely; sold-out/unavailable ones
 * are INCLUDED (the storefront renders them as out of stock and sinks them to the
 * bottom), matching the old behavior.
 */
export async function listCatalog(): Promise<Catalog> {
  const [cats, prods] = await Promise.all([
    db.query.categories.findMany({
      orderBy: (c, { asc }) => [asc(c.sort), asc(c.name)],
    }),
    db.query.products.findMany({
      // Exclude the custom-drink product — it's rendered via its own wizard entry.
      where: (p, { eq, and }) => and(eq(p.hidden, false), eq(p.isCustom, false)),
      orderBy: (p, { asc }) => [asc(p.sort), asc(p.name)],
      with: {
        category: true,
        variations: { orderBy: (v, { asc }) => [asc(v.sort), asc(v.name)] },
        images: { orderBy: (img, { asc }) => [asc(img.sort)] },
      },
    }),
  ]);

  const products: Product[] = prods.map((p) => {
    const variations: ProductVariation[] = p.variations.map((v) => ({
      id: v.id,
      name: v.name,
      priceCents: v.priceCents,
      priceLabel: formatCents(v.priceCents),
      available: v.available && !v.soldOut,
    }));

    return {
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      categoryId: p.categoryId ?? undefined,
      categoryName: p.category?.name ?? undefined,
      imageUrl: p.images[0]?.url ?? undefined,
      // Sold out when: paused, out of stock (if tracked), or every size unavailable.
      available:
        p.available &&
        (!p.trackInventory || p.stock > 0) &&
        variations.some((v) => v.available),
      variations,
      recipe: p.recipe ?? undefined,
    };
  });

  const categories = cats.map((c) => ({ id: c.id, name: c.name, baseIds: c.baseIds ?? [] }));
  return { categories, products };
}
