import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  jsonb,
  integer,
  boolean,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

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
  isOptional: boolean("is_optional").default(false),
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
});

export const itineraries = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  tourId: uuid("tour_id").references(() => tours.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  day: text("day"),
  cities: jsonb("cities").array().$type<SelectCities[]>(),
  activities: jsonb("activities").array().$type<SelectActivities[]>(),
  optionalActivities: jsonb("optional_activities")
    .array()
    .$type<SelectActivities[]>(),
});

export const nileCruises = pgTable("nile_cruises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  status: boolean("status").default(true),
  pax: integer("pax"),
  tourists: jsonb("tourists").array().$type<string[]>(),
  referenceBookingId: text("reference_booking_id"),
  internalBookingId: text("internal_booking_id"),
  company: text("company"),
  currency: text("currency"),
  arrivalDate: timestamp("arrival_date", { withTimezone: true }).defaultNow(),
  departureDate: timestamp("departure_date", {
    withTimezone: true,
  }).defaultNow(),
  hotels: jsonb("hotels").array().$type<string[]>(),
  single: integer("single"),
  double: integer("double"),
  triple: integer("triple"),
  roomNote: text("room_note"),
  internalFlights: boolean("internal_flights"),
  internalFlightsNote: text("internal_flights_note"),
  visa: boolean("visa"),
  tips: integer("tips"),
  tipsIncluded: boolean("tips_included").default(true),
  nationality: text("nationality"),
  language: text("language"),
  generalNote: text("general_note"),
  countries: jsonb("countries").array().$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  nileCruises: jsonb("nile_cruises").array().$type<string[]>(),
  internationalFlights: jsonb("international_flights")
    .array()
    .$type<Omit<ArrivalDeparturePair<InternationalFlight>, "files">[]>(),
  domesticFlights: jsonb("domestic_flights")
    .array()
    .$type<Omit<ArrivalDeparturePair<DomesticFlight>, "files">[]>(),
  passports: jsonb("passports")
    .array()
    .$type<{ url?: string; name?: string }[]>(),
});

export const bookingTours = pgTable("booking_tours", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countries: jsonb("countries")
    .array()
    .$type<(typeof countries.$inferSelect)[]>(),
  bookingId: integer("booking_id").references(() => bookings.id),
});

export const bookingItineraries = pgTable("booking_itineraries", {
  id: serial("id").primaryKey(),
  tourId: uuid("tour_id").references(() => bookingTours.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  day: text("day"),
  cities: jsonb("cities").array().$type<SelectCities[]>(),
  activities: jsonb("activities").array().$type<SelectActivities[]>(),
  optionalActivities: jsonb("optional_activities")
    .array()
    .$type<SelectActivities[]>(),
  guide: text("guide"),
});

export const reservations = pgTable("reservations", {
  id: serial("id")
    .primaryKey()
    .references(() => bookings.id),
  start: timestamp("start", { withTimezone: true }).defaultNow(),
  end: timestamp("end", { withTimezone: true }).defaultNow(),
  meal: text("meal"),
  city: jsonb("city").$type<SelectCities>(),
  hotels: jsonb("hotels").array().$type<string[]>().default([]).notNull(),
  targetPrice: integer("target_price"),
  finalPrice: integer("final_price"),
  currency: text("currency"),
  bookingId: integer("booking_id").references(() => bookings.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ many, one }) => ({
  reservations: many(reservations),
  bookingTour: one(bookingTours),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  itineraries: many(itineraries),
}));

export const BookingToursRelations = relations(
  bookingTours,
  ({ many, one }) => ({
    itineraries: many(bookingItineraries),
    booking: one(bookings, {
      fields: [bookingTours.bookingId],
      references: [bookings.id],
    }),
  }),
);

export const reservationsRelations = relations(reservations, ({ one }) => ({
  booking: one(bookings, {
    fields: [reservations.bookingId],
    references: [bookings.id],
  }),
}));

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  tour: one(tours, {
    fields: [itineraries.tourId],
    references: [tours.id],
  }),
}));

export const bookingItinerariesRelations = relations(
  bookingItineraries,
  ({ one }) => ({
    tour: one(bookingTours, {
      fields: [bookingItineraries.tourId],
      references: [bookingTours.id],
    }),
  }),
);

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
export type SelectNileCruises = typeof nileCruises.$inferSelect;
export type SelectReservations = typeof reservations.$inferSelect;
export type SelectNotifications = typeof notifications.$inferSelect;
export type SelectItineraries = typeof itineraries.$inferSelect;
export type SelectBookingTours = typeof bookingTours.$inferSelect;
export type SelectBookingItineraries = typeof bookingItineraries.$inferSelect;
//With relation types
export type SelectGuidesWithCountries = SelectGuides & {
  country: SelectCountries | null;
};
export type SelectToursWithItineraries = SelectTours & {
  itineraries: SelectItineraries[];
};
export type SelectBookingToursWithItineraries = SelectBookingTours & {
  itineraries: SelectBookingItineraries[];
};

export type SelectBookingWithItineraries = SelectBookings & {
  bookingTour: SelectBookingToursWithItineraries;
};
export type SelectBookingWithReservations = SelectBookings & {
  reservations: SelectReservations[];
  bookingTour: SelectBookingToursWithItineraries;
};
