// Read path for the Square catalog.
//
// Turns Square's verbose CatalogObject graph into a flat, storefront-friendly
// shape. This is what the storefront (Step 3) and cart/checkout (Step 4) consume,
// so the rest of the app never has to know Square's object model.
//
// Server-only (imports lib/square.ts).

import { square, locationId } from "@/lib/square";

export type ProductVariation = {
  id: string;
  name: string;
  priceCents: number;
  priceLabel: string;
  /** False when this size is marked Sold Out in Square, or not sellable. */
  available: boolean;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  /** False when archived or every variation is unavailable. */
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

// Square's Edit-item "Site Visibility" dropdown (under "Channels and visibility")
// maps to the `ecom_visibility` field. Its states — confirmed against Square's
// docs — are the EcomVisibility enum:
//   VISIBLE      shown + purchasable online
//   HIDDEN       seller hid it from the storefront (still buyable via direct link)
//   UNAVAILABLE  seller hid it AND made it unpurchasable
//   UNINDEXED    default — item was never synced to an online site (NOT hidden!)
//
// The v45 SDK doesn't type this field, but the catalog response is parsed with
// `unrecognizedObjectKeys: "passthrough"`, which recurses into itemData and keeps
// the raw key (snake_case). Verified in node_modules/square object.js:104,204.
//
// We drop an item only when the seller *explicitly* hid it (HIDDEN/UNAVAILABLE) —
// that's what the vendor-fee toggle does. Crucially we do NOT treat UNINDEXED (or
// a missing/unknown value) as hidden: this is a custom storefront, so real
// products may never have been added to a Square Online site and would carry
// UNINDEXED. Hiding those would blank legitimate items, so they stay shown.
const HIDDEN_VISIBILITIES = new Set(["HIDDEN", "UNAVAILABLE"]);
function isHiddenOnline(data: unknown): boolean {
  const v = (data as { ecomVisibility?: unknown; ecom_visibility?: unknown }) ?? {};
  const visibility = v.ecomVisibility ?? v.ecom_visibility;
  return typeof visibility === "string" && HIDDEN_VISIBILITIES.has(visibility.toUpperCase());
}

/** Fetch the full catalog (items + categories) and normalize it. */
export async function listCatalog(): Promise<Catalog> {
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
      // Hidden items (e.g. vendor fees) are removed from the storefront entirely.
      if (isHiddenOnline(data)) continue;
      const categoryId = data?.categories?.[0]?.id ?? undefined;
      const imageId = data?.imageIds?.[0];
      if (imageId) firstImageId.set(obj.id, imageId);

      const variations: ProductVariation[] = (data?.variations ?? [])
        .filter((v) => v.type === "ITEM_VARIATION")
        .map((v) => {
          const vd = v.itemVariationData;
          const cents = Number(vd?.priceMoney?.amount ?? 0n);
          // "Sold Out" covers both the manual toggle and inventory-tracked items
          // that hit zero — Square sets the same flag for both. A temporary
          // sold-out auto-clears once soldOutValidUntil passes.
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

  // Resolve category names and image URLs now that every CATEGORY and IMAGE
  // object has been seen (they can appear after items in the page).
  for (const item of items) {
    if (item.categoryId) {
      item.categoryName = categoryNames.get(item.categoryId);
    }
    const imageId = firstImageId.get(item.id);
    if (imageId) {
      item.imageUrl = imageUrls.get(imageId);
    }
  }

  const categories = [...categoryNames.entries()].map(([id, name]) => ({
    id,
    name,
  }));

  return { categories, products: items };
}
