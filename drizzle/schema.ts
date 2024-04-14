import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  jsonb,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { db } from "./db";

export const hotels = pgTable("hotels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
  cityId: uuid("city_id").references(() => cities.id, { onDelete: "cascade" }),
});

export const hotelsRelations = relations(hotels, ({ one }) => ({
  country: one(countries, {
    fields: [hotels.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [hotels.cityId],
    references: [cities.id],
  }),
}));

export const guides = pgTable("guides", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const guidesRelations = relations(guides, ({ one }) => ({
  country: one(countries, {
    fields: [guides.countryId],
    references: [countries.id],
  }),
}));

export const representatives = pgTable("representatives", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const representativesRelations = relations(
  representatives,
  ({ one }) => ({
    country: one(countries, {
      fields: [representatives.countryId],
      references: [countries.id],
    }),
  }),
);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  companyId: text("company_id"),
});

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
});

export const countriesRelations = relations(countries, ({ many }) => ({
  hotels: many(hotels),
}));

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const citiesRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
}));

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
  cityId: uuid("city_id").references(() => cities.id, {
    onDelete: "cascade",
  }),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  country: one(countries, {
    fields: [activities.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [activities.cityId],
    references: [cities.id],
  }),
}));

export const nationalities = pgTable("nationalities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
});

export const languages = pgTable("languages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
});

export const tours = pgTable("tours", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countries: jsonb("countries")
    .array()
    .$type<(typeof countries.$inferSelect)[]>(),
  itinerary: jsonb("itinerary").array().$type<Itinerary[]>(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  pax: integer("pax"),
  tourists: jsonb("tourists").array().$type<string[]>(),
  referenceBookingId: text("reference_booking_id"),
  internalBookingId: text("internal_booking_id"),
  tour: text("tour"),
  company: text("company"),
  currency: text("currency"),
  arrivalDate: timestamp("arrival_date").defaultNow(),
  departureDate: timestamp("departure_date").defaultNow(),
  hotels: jsonb("hotels").array().$type<string[]>(),
  activities: jsonb("activities").array().$type<string[]>(),
  single: integer("single"),
  double: integer("double"),
  triple: integer("triple"),
  roomNote: text("room_note"),
  internalFlights: boolean("internal_flights"),
  internalFlightsNote: text("internal_flights_note"),
  visa: boolean("visa"),
  tips: integer("tips"),
  nationality: text("nationality"),
  language: text("language"),
  generalNote: text("general_note"),
  country: text("country"),
  city: text("city"),
  guide: text("guide"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SelectCountries = typeof countries.$inferSelect;
export type SelectCities = typeof cities.$inferSelect;
export type SelectGuides = typeof guides.$inferSelect;
export type SelectActivities = typeof activities.$inferSelect;
export type SelectTours = typeof tours.$inferSelect;
export type SelectCompanies = typeof companies.$inferSelect;
export type SelectHotels = typeof hotels.$inferSelect;
export type SelectRepresentatives = typeof representatives.$inferSelect;
export type SelectBookings = typeof bookings.$inferSelect;
export type SelectNationalities = typeof nationalities.$inferSelect;
