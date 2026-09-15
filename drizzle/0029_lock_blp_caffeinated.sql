-- Blue Lightning Pop - Caffeinated (Main Character Energy) is Alani only.
UPDATE "products" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Alani') WHERE "name" = 'Blue Lightning Pop - Caffeinated' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Main Character Energy' LIMIT 1);
