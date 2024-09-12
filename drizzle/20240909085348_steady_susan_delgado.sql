ALTER TABLE "booking_optional_activities" DROP CONSTRAINT "booking_optional_activities_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "id" SET NOT NULL;