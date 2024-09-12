CREATE TABLE IF NOT EXISTS "booking_optional_activities" (
	"id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"optionalActivities" jsonb[] DEFAULT '{}' NOT NULL,
	"representatives" jsonb[] DEFAULT '{}' NOT NULL,
	"pax" integer,
	"currency" text,
	"price" integer,
	"files" jsonb[]
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_activities" ADD CONSTRAINT "booking_optional_activities_id_bookings_id_fk" FOREIGN KEY ("id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
