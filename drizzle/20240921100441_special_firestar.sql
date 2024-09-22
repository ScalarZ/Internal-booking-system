ALTER TABLE "bookings" ADD COLUMN "is_reservation_done" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "is_aviation_done" boolean DEFAULT false NOT NULL;