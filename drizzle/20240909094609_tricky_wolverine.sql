ALTER TABLE "booking_optional_activities" RENAME TO "booking_optional_tours";--> statement-breakpoint
ALTER TABLE "booking_optional_tours" DROP CONSTRAINT "booking_optional_activities_booking_id_bookings_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_tours" ADD CONSTRAINT "booking_optional_tours_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
