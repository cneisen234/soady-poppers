CREATE TYPE "public"."product_discount_kind" AS ENUM('fixed', 'percent');--> statement-breakpoint
CREATE TABLE "product_discount_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_id" uuid NOT NULL,
	"category_id" uuid,
	"product_id" uuid,
	"variation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_discount_targets_one" CHECK (num_nonnulls("product_discount_targets"."category_id", "product_discount_targets"."product_id", "product_discount_targets"."variation_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "product_discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "product_discount_kind" DEFAULT 'fixed' NOT NULL,
	"amount_off_cents" integer,
	"discount_bps" integer,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_discounts_amount" CHECK (("product_discounts"."kind" = 'fixed' AND "product_discounts"."amount_off_cents" > 0 AND "product_discounts"."discount_bps" IS NULL) OR ("product_discounts"."kind" = 'percent' AND "product_discounts"."discount_bps" > 0 AND "product_discounts"."discount_bps" <= 10000 AND "product_discounts"."amount_off_cents" IS NULL)),
	CONSTRAINT "product_discounts_window" CHECK ("product_discounts"."ends_at" IS NULL OR "product_discounts"."ends_at" > "product_discounts"."starts_at")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_discount_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_discount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_discount_targets" ADD CONSTRAINT "product_discount_targets_discount_id_product_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."product_discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_discount_targets" ADD CONSTRAINT "product_discount_targets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_discount_targets" ADD CONSTRAINT "product_discount_targets_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_discount_targets" ADD CONSTRAINT "product_discount_targets_variation_id_variations_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_discount_targets_discount_idx" ON "product_discount_targets" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "product_discounts_live_idx" ON "product_discounts" USING btree ("active","starts_at","ends_at");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_discount_id_product_discounts_id_fk" FOREIGN KEY ("product_discount_id") REFERENCES "public"."product_discounts"("id") ON DELETE set null ON UPDATE no action;