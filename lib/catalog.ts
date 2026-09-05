// Read path for the storefront catalog — now sourced from OUR Postgres database.
//
// Returns the same flat Catalog shape the storefront and checkout already consume,
// so components downstream don't change. The Square reader lives in
// lib/square-catalog.ts now and is used only by the one-time import (seed).
//
// Server-only (imports lib/db).

import { db } from "@/lib/db";

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
};

export type Catalog = {
  categories: { id: string; name: string }[];
  products: Product[];
};

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

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
      where: (p, { eq }) => eq(p.hidden, false),
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
      priceLabel: money(v.priceCents),
      available: v.available && !v.soldOut,
    }));

    return {
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      categoryId: p.categoryId ?? undefined,
      categoryName: p.category?.name ?? undefined,
      imageUrl: p.images[0]?.url ?? undefined,
      // Paused items, and items whose every size is unavailable, read as sold out.
      available: p.available && variations.some((v) => v.available),
      variations,
    };
  });

  const categories = cats.map((c) => ({ id: c.id, name: c.name }));
  return { categories, products };
}
