-- Seed the custom-drink option pools from the owners' list (one-time).
-- Runs exactly once via the migration tracker; edits/deletes in the admin
-- afterward are never overwritten by later deploys.

-- Bases: sodas, lemon-lime / orange (generic, regular + zero), sparkling waters, energy.
INSERT INTO "custom_bases" ("name") VALUES
  ('Coke'),
  ('Coke Zero'),
  ('Dr. Pepper'),
  ('Dr. Pepper Zero'),
  ('Mt. Dew'),
  ('Mt. Dew Zero'),
  ('A&W Root Beer'),
  ('A&W Root Beer Zero'),
  ('Lemon-Lime Soda'),
  ('Lemon-Lime Soda Zero'),
  ('Orange Soda'),
  ('Orange Soda Zero'),
  ('Blue Raspberry Sparkling Water'),
  ('Strawberry Sparkling Water'),
  ('Fresca'),
  ('Cherry Lime Sparkling Water'),
  ('Pink Slush Alani'),
  ('Breezeberry Alani'),
  ('Cherry Twist Alani'),
  ('Dream Float Alani'),
  ('Iced Vanilla Berry Red Bull'),
  ('Iced Vanilla Berry Red Bull Sugar Free'),
  ('White Peach Red Bull'),
  ('White Peach Red Bull Sugar Free'),
  ('Coconut Berry Red Bull');
--> statement-breakpoint

-- Syrups: one row per flavor, flagged for the variants it's offered in.
-- Offered both regular and sugar-free.
INSERT INTO "custom_syrups" ("name", "available_regular", "available_sugar_free") VALUES
  ('Banana', true, true),
  ('Blue Raspberry', true, true),
  ('Brown Sugar Cinnamon', true, true),
  ('Caramel', true, true),
  ('Cherry', true, true),
  ('Coconut', true, true),
  ('Cupcake', true, true),
  ('Green Apple', true, true),
  ('Lime', true, true),
  ('Orange', true, true),
  ('Passion Fruit', true, true),
  ('Peach', true, true),
  ('Pineapple', true, true),
  ('Raspberry', true, true),
  ('Strawberry', true, true),
  ('Toasted Marshmallow', true, true),
  ('Vanilla', true, true),
  ('Watermelon', true, true),
  ('White Chocolate', true, true),
-- Regular only.
  ('Blackberry', true, false),
  ('Cake Batter', true, false),
  ('Cheesecake', true, false),
  ('Cinnamon Roll', true, false),
  ('Cookie Butter', true, false),
  ('Kiwi', true, false),
  ('Lavender', true, false),
  ('Mango', true, false),
  ('Prickly Pear', true, false),
  ('Pumpkin Pie', true, false),
  ('Sour Gummy Worm', true, false),
-- Sugar-free only.
  ('Blueberry Muffin', false, true),
  ('Cookie Dough', false, true),
  ('Pumpkin Cheesecake', false, true),
  ('Raspberry Torte', false, true),
  ('Sour Rainbow Belt', false, true),
  ('Strawberry Peach', false, true),
  ('Strawberry Shortcake', false, true);
--> statement-breakpoint

-- Milk alternatives.
INSERT INTO "custom_milks" ("name") VALUES
  ('Oat Milk'),
  ('Coconut Milk');
