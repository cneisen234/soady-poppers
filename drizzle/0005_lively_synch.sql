CREATE TYPE "public"."coupon_kind" AS ENUM('percent', 'fixed');--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "discount_bps" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "kind" "coupon_kind" DEFAULT 'percent' NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "amount_off_cents" integer;