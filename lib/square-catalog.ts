// Square catalog reader — normalizes Square's CatalogObject graph into our flat
// Catalog shape. This is now used ONLY by the one-time import (scripts/seed.ts);
// the app itself reads the catalog from Postgres via lib/catalog.ts.
//
// Server-only (imports lib/square.ts).

import { square, locationId } from "@/lib/square";
import type { Catalog, Product, ProductVariation } from "@/lib/catalog";

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Square's Edit-item "Site Visibility" dropdown maps to `ecom_visibility`
// (EcomVisibility enum). We drop an item only when the seller *explicitly* hid it
// (HIDDEN/UNAVAILABLE) — the vendor-fee case. UNINDEXED (the default for items
// never added to a Square Online site) and missing values stay visible, so real
// products aren't blanked. The field is undocumented in the v45 SDK but survives
// on itemData because the response is parsed with unrecognizedObjectKeys:passthrough.
const HIDDEN_VISIBILITIES = new Set(["HIDDEN", "UNAVAILABLE"]);
function isHiddenOnline(data: unknown): boolean {
  const v = (data as { ecomVisibility?: unknown; ecom_visibility?: unknown }) ?? {};
  const visibility = v.ecomVisibility ?? v.ecom_visibility;
  return typeof visibility === "string" && HIDDEN_VISIBILITIES.has(visibility.toUpperCase());
}

/** Fetch + normalize the live Square catalog (import source only). */
export async function listSquareCatalog(): Promise<Catalog> {
  const page = await square().catalog.list({ types: "ITEM,CATEGORY,IMAGE" });

  const categoryNames = new Map<string, string>();
  const imageUrls = new Map<string, string>();
  const firstImageId = new Map<string, string>(); // product id -> its first image id
  const items: Product[] = [];

  for await (const obj of page) {
    if (obj.type === "CATEGORY") {
      if (obj.id) categoryNames.set(obj.id, obj.categoryData?.name ?? "Uncategorized");
    } else if (obj.type === "IMAGE") {
      const url = obj.imageData?.url;
      if (url) imageUrls.set(obj.id, url);
    } else if (obj.type === "ITEM") {
      const data = obj.itemData;
      // Hidden items (e.g. vendor fees) are removed entirely.
      if (isHiddenOnline(data)) continue;
      const categoryId = data?.categories?.[0]?.id ?? undefined;
      const imageId = data?.imageIds?.[0];
      if (imageId) firstImageId.set(obj.id, imageId);

      const variations: ProductVariation[] = (data?.variations ?? [])
        .filter((v) => v.type === "ITEM_VARIATION")
        .map((v) => {
          const vd = v.itemVariationData;
          const cents = Number(vd?.priceMoney?.amount ?? 0n);
          const override = (vd?.locationOverrides ?? []).find(
            (o) => o.locationId === locationId(),
          );
          let soldOut = override?.soldOut === true;
          if (soldOut && override?.soldOutValidUntil) {
            soldOut = Date.now() < new Date(override.soldOutValidUntil).getTime();
          }
          return {
            id: v.id,
            name: vd?.name ?? "Regular",
            priceCents: cents,
            priceLabel: money(cents),
            available: vd?.sellable !== false && !soldOut,
          };
        });

      const archived = data?.isArchived === true;
      items.push({
        id: obj.id,
        name: data?.name ?? "Unnamed",
        description: data?.description ?? undefined,
        categoryId,
        available: !archived && variations.some((v) => v.available),
        variations,
      });
    }
  }

  for (const item of items) {
    if (item.categoryId) item.categoryName = categoryNames.get(item.categoryId);
    const imageId = firstImageId.get(item.id);
    if (imageId) item.imageUrl = imageUrls.get(imageId);
  }

  const categories = [...categoryNames.entries()].map(([id, name]) => ({ id, name }));
  return { categories, products: items };
}
