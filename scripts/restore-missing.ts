// Non-destructive restore: adds back any menu item that's missing from the DB
// (e.g. one deleted by accident) WITHOUT wiping or changing existing items.
// Matches on category name + product name. Run with `npm run db:restore`.

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { MENU } = await import("./menu-data");
  const { db } = await import("@/lib/db");
  const { categories, products, variations } = await import("@/lib/db/schema");

  const existing = await db.query.products.findMany({ with: { category: true } });
  const have = new Set(existing.map((p) => `${p.category?.name ?? ""}||${p.name}`));

  const cats = await db.select().from(categories);
  const catByName = new Map(cats.map((c) => [c.name, c.id]));

  let added = 0;
  for (const cat of MENU) {
    for (const [pi, item] of cat.items.entries()) {
      if (have.has(`${cat.name}||${item.name}`)) continue;

      const categoryId = catByName.get(cat.name) ?? null;
      const [p] = await db
        .insert(products)
        .values({
          categoryId,
          name: item.name,
          description: item.description ?? null,
          hidden: item.hidden ?? false,
          sort: pi,
        })
        .returning({ id: products.id });

      const sizes = item.sizes ?? cat.sizes ?? [];
      for (const [si, s] of sizes.entries()) {
        await db.insert(variations).values({
          productId: p.id,
          name: s.name,
          priceCents: Math.round(s.price * 100),
          sort: si,
        });
      }
      added++;
      console.log(`  restored: ${cat.name} → ${item.name}`);
    }
  }

  console.log(added === 0 ? "Nothing missing — catalog already complete." : `Added back ${added} item(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Restore failed:", err);
    process.exit(1);
  });
