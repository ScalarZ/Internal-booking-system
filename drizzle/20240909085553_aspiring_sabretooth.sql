ALTER TABLE "booking_optional_activities" DROP CONSTRAINT "booking_optional_activities_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD COLUMN "booking_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_activities" ADD CONSTRAINT "booking_optional_activities_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
