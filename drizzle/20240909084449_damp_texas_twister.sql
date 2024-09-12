ALTER TABLE "booking_optional_activities" RENAME COLUMN "representative_id" TO "representatives";--> statement-breakpoint
ALTER TABLE "booking_optional_activities" DROP CONSTRAINT "booking_optional_activities_representative_id_representatives_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "representatives" SET DATA TYPE jsonb[];--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "representatives" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ALTER COLUMN "representatives" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_optional_activities" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();