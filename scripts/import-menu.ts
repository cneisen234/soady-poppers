// Full catalog import — WIPES and reloads the catalog from the real menu
// (scripts/menu-data.ts) and ensures the singleton settings row exists. Orders
// and payments are untouched, and existing settings are preserved.
// This is the production seed: run with `npm run db:menu`. For a non-destructive
// top-up of the catalog, use restore-missing.

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { MENU } = await import("./menu-data");
  const { db } = await import("@/lib/db");
  const { categories, products, variations, settings } = await import("@/lib/db/schema");

  let productCount = 0;
  let variationCount = 0;

  await db.transaction(async (tx) => {
    await tx.delete(products); // cascades variations + images
    await tx.delete(categories);

    for (const [ci, cat] of MENU.entries()) {
      const [c] = await tx
        .insert(categories)
        .values({ name: cat.name, sort: ci })
        .returning({ id: categories.id });

      for (const [pi, item] of cat.items.entries()) {
        const [p] = await tx
          .insert(products)
          .values({
            categoryId: c.id,
            name: item.name,
            description: item.description ?? null,
            hidden: item.hidden ?? false,
            sort: pi,
          })
          .returning({ id: products.id });
        productCount++;

        const sizes = item.sizes ?? cat.sizes ?? [];
        for (const [si, s] of sizes.entries()) {
          await tx.insert(variations).values({
            productId: p.id,
            name: s.name,
            priceCents: Math.round(s.price * 100),
            sort: si,
          });
          variationCount++;
        }
      }
    }

    // Ensure the singleton settings row exists (defaults come from the schema).
    // Preserves an existing row so saved tax/delivery/hours aren't reset.
    await tx.insert(settings).values({ id: 1 }).onConflictDoNothing();
  });

  console.log(
    `Imported ${MENU.length} categories, ${productCount} products, ${variationCount} variations.`,
  );
}

main()
  .then(() => {
    console.log("✓ Menu import complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Import failed:", err);
    process.exit(1);
  });
