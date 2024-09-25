ALTER TABLE "bookings" ADD COLUMN "credit_balance" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "paid" boolean DEFAULT false;