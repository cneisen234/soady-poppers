-- Pool additions found while structuring the menu recipes (one-time).

-- New bases (regular / sugar-free flags; owner can adjust in the admin).
INSERT INTO "custom_bases" ("name", "available_regular", "available_sugar_free") VALUES
  ('Lemonade', true, true),            -- lemonade base; sugar-free lemonade available
  ('Sparkling Water', true, true),     -- plain, neutral base for Fizzy Fix drinks
  ('Red Bull', true, false),           -- regular energy base (has sugar)
  ('Alani', true, true);               -- zero-sugar energy base

-- New syrups spotted in item descriptions (SF availability unknown -> regular).
INSERT INTO "custom_syrups" ("name", "available_regular", "available_sugar_free") VALUES
  ('Cotton Candy', true, false),
  ('Tangerine', true, false),
  ('Berry', true, false);

-- Creams & toppings pool.
INSERT INTO "custom_toppings" ("name") VALUES
  ('Cream'),
  ('Cold Foam'),
  ('Coconut Cream'),
  ('Cereal Topping'),
  ('Edible Glitter'),
  ('White Chocolate Drizzle'),
  ('Freeze-Dried Strawberries');
