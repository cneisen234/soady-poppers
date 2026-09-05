// One-time catalog import: pull the current Square catalog and load it into
// Postgres. Run with `npm run db:seed`.
//
// This WIPES and reloads the catalog tables (categories/products/variations/
// images) inside a transaction, so re-running is safe and always mirrors Square's
// current state. Orders/payments and the settings row are left untouched.
//
// Source is the existing lib/catalog.ts (still reading Square at this step). It
// runs against whatever Square account .env.local points at — sandbox while
// building, production at cutover (Step 7). Hidden items (e.g. vendor fees) are
// already filtered out by lib/catalog, so they don't get imported.
//
// Env is loaded before any app import so the db client sees DATABASE_URL.

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("@/lib/db");
  const { categories, products, variations, productImages, settings } =
    await import("@/lib/db/schema");
  const { listSquareCatalog } = await import("@/lib/square-catalog");

  console.log("Fetching catalog from Square…");
  const catalog = await listSquareCatalog();
  console.log(
    `  ${catalog.categories.length} categories, ${catalog.products.length} products`,
  );

  let variationCount = 0;
  let imageCount = 0;

  await db.transaction(async (tx) => {
    // Clear the catalog. Deleting products cascades to variations + images.
    await tx.delete(products);
    await tx.delete(categories);

    // Categories — map each Square category id to the new row's uuid.
    const catIdBySquareId = new Map<string, string>();
    for (const [i, c] of catalog.categories.entries()) {
      const [row] = await tx
        .insert(categories)
        .values({ name: c.name, sort: i })
        .returning({ id: categories.id });
      catIdBySquareId.set(c.id, row.id);
    }

    // Products + variations + first image.
    for (const [i, p] of catalog.products.entries()) {
      const categoryId = p.categoryId
        ? catIdBySquareId.get(p.categoryId) ?? null
        : null;

      const [prod] = await tx
        .insert(products)
        .values({
          categoryId,
          name: p.name,
          description: p.description ?? null,
          available: p.available,
          hidden: false,
          sort: i,
        })
        .returning({ id: products.id });

      for (const [j, v] of p.variations.entries()) {
        await tx.insert(variations).values({
          productId: prod.id,
          name: v.name,
          priceCents: v.priceCents,
          available: v.available,
          sort: j,
        });
        variationCount++;
      }

      if (p.imageUrl) {
        await tx.insert(productImages).values({ productId: prod.id, url: p.imageUrl });
        imageCount++;
      }
    }

    // Ensure the singleton settings row exists (defaults from the schema).
    await tx.insert(settings).values({ id: 1 }).onConflictDoNothing();
  });

  console.log(
    `Seeded: ${catalog.categories.length} categories, ${catalog.products.length} products, ${variationCount} variations, ${imageCount} images.`,
  );
}

main()
  .then(() => {
    console.log("✓ Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });
