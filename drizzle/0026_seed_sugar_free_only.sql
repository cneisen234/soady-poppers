-- Items that are sugar-free only (per the owner's email). The base offers both
-- styles, so this item-level flag forces sugar-free and the wizard hides regular.
UPDATE "products" SET "sugar_free_only" = true WHERE "name" = 'Blue Lightning Pop' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "sugar_free_only" = true WHERE "name" = 'Mango Tango' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "sugar_free_only" = true WHERE "name" = 'Apple Island Punch' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Fizzy Fix' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "sugar_free_only" = true WHERE "name" = 'Blue Lightning Pop' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
