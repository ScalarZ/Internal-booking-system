CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"representatives" jsonb[],
	"files" jsonb[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"representatives" jsonb[],
	"files" jsonb[]
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "surveys" ADD CONSTRAINT "surveys_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
