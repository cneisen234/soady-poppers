ALTER TABLE "settings" ADD COLUMN "custom_free_syrups" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "custom_max_syrups" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "addon_syrup_cents" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "addon_caffeine_cents" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "addon_electrolyte_cents" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "addon_milk_cents" integer DEFAULT 50 NOT NULL;