// Canonical catalog import — the shop's real menu, transcribed from the printed
// boards (Dirty Soda / Fresh-Squeezed Lemonade / Energy + Fizzy + Lattes).
//
// This is now the source of truth for BOTH /order and /menu. It WIPES and reloads
// the catalog (categories/products/variations/images) in a transaction; orders,
// payments, and settings are untouched. Run with `npm run db:menu`.
//
// Categories are LEAF groups (Coke Creations, Mt. Dew Magic, …) so lib/shop.ts's
// thin layout config can group them into display sections on /menu.
//
// Convention: Basic = 16 oz, Bougie = 32 oz (from the Dirty Soda board).

import { config } from "dotenv";
config({ path: ".env.local" });

type Size = { name: string; price: number }; // price in dollars
type Item = { name: string; description?: string; sizes?: Size[]; hidden?: boolean };
type Cat = { name: string; sizes?: Size[]; items: Item[] };

const DIRTY: Size[] = [
  { name: "Basic · 16 oz", price: 6 },
  { name: "Bougie · 32 oz", price: 8 },
];
const ENERGY: Size[] = [
  { name: "Basic · 16 oz", price: 8 },
  { name: "Bougie · 32 oz", price: 11 },
];
const FIZZY: Size[] = [
  { name: "Basic · 16 oz", price: 6 },
  { name: "Bougie · 32 oz", price: 8 },
];
const LATTE: Size[] = [
  { name: "Basic · 16 oz", price: 6 },
  { name: "Bougie · 32 oz", price: 8 },
];
const lemon = (price: number): Size[] => [{ name: "32 oz", price }];

const MENU: Cat[] = [
  // ---- Dirty Soda ($6 / $8) ----
  {
    name: "Coke Creations",
    sizes: DIRTY,
    items: [
      { name: "Love You Cherry Much", description: "Cherry · Vanilla · Cold Foam" },
      { name: "Main Squeeze", description: "Vanilla · Lime · Cream · Available with Coconut" },
      { name: "Creamy Cutie", description: "White Chocolate · Cream · Cold Foam" },
    ],
  },
  {
    name: "Mt. Dew Magic",
    sizes: DIRTY,
    items: [
      { name: "Lime in Love", description: "Lime · Vanilla · Cream · Cold Foam" },
      { name: "Griff's Pick", description: "Pineapple · Green Apple · Cream" },
      { name: "Dew Got Me", description: "Raspberry · Coconut · Cream · Cold Foam" },
    ],
  },
  {
    name: "Citrus Sips",
    sizes: DIRTY,
    items: [
      { name: "Blue Crush", description: "Blue Raspberry · Vanilla · Cream" },
      { name: "Rainbow Riot", description: "Raspberry · Orange · Lime · Vanilla · Cream" },
      { name: "Cherry Bombshell", description: "Cherry · Lime · Vanilla · Cream · Cold Foam" },
      { name: "Watermelon Sugar", description: "Watermelon · Strawberry · Cream · Cold Foam" },
    ],
  },
  {
    name: "Dr. Pepper Delights",
    sizes: DIRTY,
    items: [
      { name: "Coco Crush", description: "Vanilla · Coconut · Cream · Available with Lime" },
      { name: "Midnight Crush", description: "Blue Razz · Watermelon · Cream · Cold Foam" },
      { name: "Velvet Pepper", description: "White Chocolate · Vanilla · Cream" },
      { name: "Pretty in Pink", description: "Freeze-Dried Strawberries · Cupcake · White Chocolate · Cold Foam" },
    ],
  },
  {
    name: "Orange Oasis",
    sizes: DIRTY,
    items: [
      { name: "Orange You Glad", description: "Vanilla · Cream · Cold Foam" },
      { name: "Bedrock Baddie", description: "Strawberry · White Chocolate Drizzle · Cream · Cold Foam · Cereal Topping" },
    ],
  },

  // ---- Fresh-Squeezed Lemonade (32 oz only) ----
  {
    name: "Classic Lemonade",
    sizes: lemon(8),
    items: [{ name: "Classic Lemonade", description: "Fresh-squeezed · 32 oz" }],
  },
  {
    name: "Flavored Lemonade",
    sizes: lemon(9),
    items: [
      { name: "Berry Babe", description: "Strawberry & Raspberry" },
      { name: "Blue Lagoon", description: "Blue Raspberry + Coconut" },
      { name: "Electric Apple", description: "Green Apple + Blue Raspberry" },
      { name: "Kiwi Kick", description: "Kiwi & Lime" },
      { name: "Sunset Sipper", description: "Passion Fruit + Orange" },
      { name: "Island Splash", description: "Mango & Pineapple" },
      { name: "Summer Fling", description: "Watermelon + Coconut" },
      { name: "Custom Flavor", description: "Over 20+ options · 2 flavors included · extras available" },
    ],
  },
  {
    name: "Dirty Lemonade",
    sizes: lemon(10),
    items: [
      { name: "Lemon Bar Babe", description: "Vanilla + Cream" },
      { name: "Peaches & Cream Dream", description: "Peach + Vanilla + Cream" },
      { name: "Coconut Cloud", description: "Coconut + Vanilla + Cream" },
      { name: "Tropic Like It's Hot", description: "Pineapple + Coconut + Coconut Cream" },
      { name: "Pretty in Pink", description: "Strawberry + Cupcake + Cream" },
      { name: "Watermelon Sugar Rush", description: "Watermelon + Strawberry + Cream" },
      { name: "Pineapple Whip", description: "Pineapple + White Chocolate + Cream" },
      { name: "Custom Flavor", description: "Over 20+ options · 2 flavors included · extras available" },
    ],
  },

  // ---- Main Character Energy ($8 / $11) ----
  {
    name: "Main Character Energy",
    sizes: ENERGY,
    items: [
      { name: "Pink Sunset", description: "Strawberry · Passion Fruit · Cream · Cold Foam" },
      { name: "Blue Lightning Pop", description: "Blue Razz · Lime · Cotton Candy · Cold Foam" },
      { name: "Rainbow Rush", description: "Raspberry · Lime · Cream · Cold Foam" },
      { name: "Pink Cloud Energy", description: "Peach · Strawberry · Cream · Cold Foam" },
      { name: "Berry Bliss", description: "Berry · Vanilla · Choice of Sweet, Coconut or Strawberry Cold Foam" },
    ],
  },

  // ---- Fizzy Fix ($6 / $8) ----
  {
    name: "Fizzy Fix",
    sizes: FIZZY,
    items: [
      { name: "Pink Sunset", description: "Strawberry · Passion Fruit · Cream · Cold Foam" },
      { name: "Blue Lightning Pop", description: "Blue Razz · Lime · Cotton Candy · Cold Foam" },
      { name: "Mango Tango", description: "Mango · Tangerine · Lime · Kiwi · Cold Foam" },
      { name: "Apple Island Punch", description: "Green Apple · Pineapple · Passion Fruit" },
    ],
  },

  // ---- Not Feelin' Fizzy? — Lattes ($6 / $8) ----
  {
    name: "Iced Lattes",
    sizes: LATTE,
    items: [
      { name: "Vanilla Iced Latte" },
      { name: "Caramel Iced Latte" },
      { name: "Dark Chocolate Iced Latte" },
      { name: "White Chocolate Iced Latte" },
      { name: "White Chocolate Raspberry Iced Latte" },
    ],
  },
  {
    name: "Chai Lattes",
    sizes: LATTE,
    items: [
      { name: "Campfire Chai" },
      { name: "Brown Sugar Babe" },
      { name: "Chai It Your Way" },
    ],
  },

  // ---- Signature (price not on the printed menu — imported HIDDEN, set in admin) ----
  {
    name: "Signature",
    sizes: FIZZY,
    items: [
      {
        name: "Marlee-Boo Barbie",
        description:
          "Double Strawberry · Cream · Edible Glitter · Sugar-free only · Available with sparkling water or energy base",
        hidden: true,
      },
    ],
  },
];

async function main() {
  const { db } = await import("@/lib/db");
  const { categories, products, variations } = await import("@/lib/db/schema");

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
