-- Map each regular base to its sugar-free counterpart (Coke → Coke Zero, etc.).
-- The wizard's sugar-free toggle swaps a base with this counterpart and back.
-- Ids resolved BY NAME (they differ between environments).
UPDATE "custom_bases" r SET "sugar_free_id" = z."id" FROM "custom_bases" z WHERE r."name" = 'Coke' AND z."name" = 'Coke Zero';
--> statement-breakpoint
UPDATE "custom_bases" r SET "sugar_free_id" = z."id" FROM "custom_bases" z WHERE r."name" = 'Mt. Dew' AND z."name" = 'Mt. Dew Zero';
--> statement-breakpoint
UPDATE "custom_bases" r SET "sugar_free_id" = z."id" FROM "custom_bases" z WHERE r."name" = 'Dr. Pepper' AND z."name" = 'Dr. Pepper Zero';
--> statement-breakpoint
UPDATE "custom_bases" r SET "sugar_free_id" = z."id" FROM "custom_bases" z WHERE r."name" = 'Lemon-Lime Soda' AND z."name" = 'Lemon-Lime Soda Zero';
--> statement-breakpoint
UPDATE "custom_bases" r SET "sugar_free_id" = z."id" FROM "custom_bases" z WHERE r."name" = 'Orange Soda' AND z."name" = 'Orange Soda Zero';
--> statement-breakpoint
UPDATE "custom_bases" r SET "sugar_free_id" = z."id" FROM "custom_bases" z WHERE r."name" = 'A&W Root Beer' AND z."name" = 'A&W Root Beer Zero';
