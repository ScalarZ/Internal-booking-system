CREATE TABLE IF NOT EXISTS "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"country_id" uuid,
	"city_id" uuid,
	"is_optional" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_hotels" (
	"booking_id" integer,
	"hotel_id" integer,
	CONSTRAINT "booking_hotels_booking_id_hotel_id_pk" PRIMARY KEY("booking_id","hotel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_itineraries" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"day" text,
	"cities" jsonb[],
	"activities" jsonb[],
	"optional_activities" jsonb[],
	"guide" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"countries" jsonb[],
	"booking_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" boolean DEFAULT true,
	"pax" integer,
	"tourists" jsonb[],
	"reference_booking_id" text,
	"internal_booking_id" text,
	"company" text,
	"currency" text,
	"arrival_date" timestamp with time zone DEFAULT now(),
	"departure_date" timestamp with time zone DEFAULT now(),
	"hotels" jsonb[],
	"single" integer,
	"double" integer,
	"triple" integer,
	"room_note" text,
	"internal_flights" boolean,
	"internal_flights_note" text,
	"visa" boolean,
	"tips" integer,
	"tips_included" boolean DEFAULT true,
	"nationality" text,
	"language" text,
	"general_note" text,
	"countries" jsonb[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"nile_cruises" jsonb[],
	"international_flights" jsonb[],
	"domestic_flights" jsonb[],
	"passports" jsonb[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"country_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"company_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"country_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hotels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"country_id" uuid,
	"city_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "itineraries" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"day" text,
	"cities" jsonb[],
	"activities" jsonb[],
	"optional_activities" jsonb[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nationalities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nile_cruises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "representatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"country_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"start" timestamp with time zone DEFAULT now(),
	"end" timestamp with time zone DEFAULT now(),
	"meal" text,
	"city" jsonb,
	"hotels" jsonb[] DEFAULT '{}' NOT NULL,
	"target_price" integer,
	"final_price" integer,
	"currency" text,
	"booking_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"countries" jsonb[]
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_hotels" ADD CONSTRAINT "booking_hotels_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_hotels" ADD CONSTRAINT "booking_hotels_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_itineraries" ADD CONSTRAINT "booking_itineraries_tour_id_booking_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."booking_tours"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_tours" ADD CONSTRAINT "booking_tours_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guides" ADD CONSTRAINT "guides_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotels" ADD CONSTRAINT "hotels_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotels" ADD CONSTRAINT "hotels_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "representatives" ADD CONSTRAINT "representatives_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_bookings_id_fk" FOREIGN KEY ("id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservations" ADD CONSTRAINT "reservations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
