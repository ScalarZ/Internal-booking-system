ALTER TABLE "itineraries" DROP CONSTRAINT "itineraries_tour_id_tours_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
