ALTER TABLE "booking_hotels" DROP CONSTRAINT "booking_hotels_booking_id_hotel_id_pk";--> statement-breakpoint
ALTER TABLE "booking_hotels" DROP CONSTRAINT "booking_hotels_pkey";--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "booking_tours" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "booking_tours" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cities" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "cities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "countries" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "countries" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "guides" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "guides" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "hotels" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "hotels" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "languages" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "nationalities" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "nationalities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "nile_cruises" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "nile_cruises" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "representatives" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "representatives" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tours" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "tours" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "booking_hotels" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;