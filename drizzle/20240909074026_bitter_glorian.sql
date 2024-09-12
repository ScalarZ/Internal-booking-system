CREATE TABLE IF NOT EXISTS "booking_optional_activities" (
	"id" integer,
	"optionalActivities" jsonb[] DEFAULT '{}' NOT NULL,
	"representative_id" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_activities" ADD CONSTRAINT "booking_optional_activities_representative_id_representatives_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."representatives"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_activities" ADD CONSTRAINT "booking_optional_activities_id_bookings_id_fk" FOREIGN KEY ("id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
