-- Pin specific Main Character Energy drinks to a single base (per the owner's
-- email). MCE's category offers Red Bull + Alani; these items are one-base only,
-- so we set products.base_ids to override the category. Ids resolved BY NAME
-- (they differ between environments). Scoped to the MCE category so the same-named
-- items in other categories are untouched.
UPDATE "products" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Alani') WHERE "name" = 'Blue Lightning Pop' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Alani') WHERE "name" = 'Pink Sunset' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Alani') WHERE "name" = 'Rainbow Rush' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Red Bull') WHERE "name" = 'Pink Cloud Energy' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
--> statement-breakpoint
UPDATE "products" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Red Bull') WHERE "name" = 'Berry Bliss' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
