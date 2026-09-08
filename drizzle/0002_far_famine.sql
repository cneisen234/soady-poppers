ALTER TYPE "public"."order_status" ADD VALUE 'out_for_delivery' BEFORE 'completed';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'refunded';