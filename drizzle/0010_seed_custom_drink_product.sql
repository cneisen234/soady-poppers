-- Seed the single, always-present Custom Drink product (one-time). Its variations
-- are the custom drink's sizes/prices, editable in Settings → Custom Drink. Uses a
-- fixed id so nothing else needs to look it up by name.
INSERT INTO "products" ("id", "name", "description", "is_custom", "available", "hidden", "sort")
VALUES (
  '00000000-0000-0000-0000-0000000000cd',
  'Custom Drink',
  'Build your own drink — pick a base, flavors and add-ons.',
  true,
  true,
  false,
  0
);
--> statement-breakpoint

-- Default sizes (editable later in Settings).
INSERT INTO "variations" ("product_id", "name", "price_cents", "sort") VALUES
  ('00000000-0000-0000-0000-0000000000cd', '16 oz', 600, 0),
  ('00000000-0000-0000-0000-0000000000cd', '32 oz', 800, 1);
