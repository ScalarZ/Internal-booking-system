/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'booking_optional_activities'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "booking_optional_activities" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_activities" ADD CONSTRAINT "booking_optional_activities_id_bookings_id_fk" FOREIGN KEY ("id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
