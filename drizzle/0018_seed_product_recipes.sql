-- Seed structured recipes for every customizable menu drink (Step 6).
-- Ingredients hand-mapped from each item's description; base is inherited from the
-- category, so recipes carry only flavors (syrups) + creams/toppings. Ids are
-- resolved BY NAME (they differ between environments). Lattes, plain Classic
-- Lemonade, and "Custom Flavor" promo items intentionally get no recipe.

UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Strawberry', 'Raspberry')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Berry Babe' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Blue Raspberry', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Blue Crush' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Citrus Sips' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Vanilla', 'Coconut')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Coco Crush' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dr. Pepper Delights' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Lemon Bar Babe' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Lime', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Lime in Love' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Mt. Dew Magic' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Cherry', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cold Foam'))
) WHERE "name" = 'Love You Cherry Much' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Coke Creations' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Strawberry')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Edible Glitter'))
) WHERE "name" = 'Marlee-Boo Barbie' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Signature' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Orange You Glad' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Orange Oasis' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Strawberry', 'Passion Fruit')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Pink Sunset' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Strawberry', 'Passion Fruit')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Pink Sunset' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Strawberry')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('White Chocolate Drizzle', 'Cream', 'Cold Foam', 'Cereal Topping'))
) WHERE "name" = 'Bedrock Baddie' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Orange Oasis' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Blue Raspberry', 'Coconut')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Blue Lagoon' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Blue Raspberry', 'Lime', 'Cotton Candy')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cold Foam'))
) WHERE "name" = 'Blue Lightning Pop' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Blue Raspberry', 'Lime', 'Cotton Candy')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cold Foam'))
) WHERE "name" = 'Blue Lightning Pop' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Pineapple', 'Green Apple')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Griff''s Pick' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Mt. Dew Magic' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Vanilla', 'Lime')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Main Squeeze' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Coke Creations' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Blue Raspberry', 'Watermelon')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Midnight Crush' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dr. Pepper Delights' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Peach', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Peaches & Cream Dream' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Raspberry', 'Orange', 'Lime', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Rainbow Riot' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Citrus Sips' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Cherry', 'Lime', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Cherry Bombshell' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Citrus Sips' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Coconut', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Coconut Cloud' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('White Chocolate')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Creamy Cutie' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Coke Creations' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Raspberry', 'Coconut')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Dew Got Me' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Mt. Dew Magic' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Green Apple', 'Blue Raspberry')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Electric Apple' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Mango', 'Tangerine', 'Lime', 'Kiwi')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cold Foam'))
) WHERE "name" = 'Mango Tango' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Raspberry', 'Lime')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Rainbow Rush' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('White Chocolate', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Velvet Pepper' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dr. Pepper Delights' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Green Apple', 'Pineapple', 'Passion Fruit')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Apple Island Punch' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Kiwi', 'Lime')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Kiwi Kick' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Peach', 'Strawberry')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Pink Cloud Energy' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Cupcake', 'White Chocolate')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Freeze-Dried Strawberries', 'Cold Foam'))
) WHERE "name" = 'Pretty in Pink' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dr. Pepper Delights' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Pineapple', 'Coconut')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Coconut Cream'))
) WHERE "name" = 'Tropic Like It''s Hot' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Watermelon', 'Strawberry')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream', 'Cold Foam'))
) WHERE "name" = 'Watermelon Sugar' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Citrus Sips' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Berry', 'Vanilla')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cold Foam'))
) WHERE "name" = 'Berry Bliss' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Strawberry', 'Cupcake')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Pretty in Pink' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Passion Fruit', 'Orange')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Sunset Sipper' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Mango', 'Pineapple')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Island Splash' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Watermelon', 'Strawberry')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Watermelon Sugar Rush' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Pineapple', 'White Chocolate')),
  'toppingIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_toppings" WHERE "name" IN ('Cream'))
) WHERE "name" = 'Pineapple Whip' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Dirty Lemonade' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "recipe" = jsonb_build_object(
  'syrupIds', (SELECT coalesce(jsonb_agg("id"), '[]'::jsonb) FROM "custom_syrups" WHERE "name" IN ('Watermelon', 'Coconut')),
  'toppingIds', '[]'::jsonb
) WHERE "name" = 'Summer Fling' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Flavored Lemonade' LIMIT 1);
