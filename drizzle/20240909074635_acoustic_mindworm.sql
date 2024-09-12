ALTER TABLE "booking_optional_activities" DROP CONSTRAINT "booking_optional_activities_representative_id_representatives_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD COLUMN "pax" integer;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD COLUMN "files" jsonb[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_optional_activities" ADD CONSTRAINT "booking_optional_activities_representative_id_representatives_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."representatives"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
