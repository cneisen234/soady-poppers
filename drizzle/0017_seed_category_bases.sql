-- Assign each customizable category its base(s) (one-time). Categories are
-- defined by their base; lattes get none (not customizable).
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Coke') WHERE "name" = 'Coke Creations';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Mt. Dew') WHERE "name" = 'Mt. Dew Magic';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Dr. Pepper') WHERE "name" = 'Dr. Pepper Delights';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Lemon-Lime Soda') WHERE "name" = 'Citrus Sips';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Orange Soda') WHERE "name" = 'Orange Oasis';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Sparkling Water') WHERE "name" = 'Fizzy Fix';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" IN ('Red Bull', 'Alani')) WHERE "name" = 'Main Character Energy';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" IN ('Sparkling Water', 'Alani')) WHERE "name" = 'Signature';
--> statement-breakpoint
UPDATE "categories" SET "base_ids" = (SELECT jsonb_agg("id") FROM "custom_bases" WHERE "name" = 'Lemonade') WHERE "name" IN ('Classic Lemonade', 'Flavored Lemonade', 'Dirty Lemonade');
