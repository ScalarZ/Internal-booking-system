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
import { optional } from "zod";

export const hotels = pgTable("hotels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
  cityId: uuid("city_id").references(() => cities.id, { onDelete: "cascade" }),
});

export const guides = pgTable("guides", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const representatives = pgTable("representatives", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  companyId: text("company_id"),
});

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
});

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

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
  tourId: uuid("tour_id").references(() => tours.id, {
    onDelete: "cascade",
  }),
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
  roomingList: text("rooming_list"),
  flightsGeneralNote: text("flights_general_note"),
  creditBalance: text("credit_balance"),
  paid: boolean("paid").default(false),
});

export const bookingTours = pgTable("booking_tours", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  countries: jsonb("countries")
    .array()
    .$type<(typeof countries.$inferSelect)[]>(),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),
});

export const bookingItineraries = pgTable("booking_itineraries", {
  id: serial("id").primaryKey(),
  tourId: uuid("tour_id").references(() => bookingTours.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  day: text("day"),
  dayNumber: integer("day_number"),
  cities: jsonb("cities").array().$type<SelectCities[]>(),
  activities: jsonb("activities").array().$type<SelectActivities[]>(),
  optionalActivities: jsonb("optional_activities")
    .array()
    .$type<SelectActivities[]>(),
  guide: text("guide"),
  optionalGuide: text("optional_guide"),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  start: timestamp("start", { withTimezone: true }).defaultNow(),
  end: timestamp("end", { withTimezone: true }).defaultNow(),
  meal: text("meal"),
  city: jsonb("city").$type<SelectCities>(),
  hotels: jsonb("hotels").array().$type<string[]>().default([]).notNull(),
  targetPrice: integer("target_price"),
  finalPrice: integer("final_price"),
  currency: text("currency"),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),
  single: integer("single"),
  double: integer("double"),
  triple: integer("triple"),
  free: integer("free"),
  refund: integer("refund"),
  child: integer("child"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookingHotels = pgTable("booking_hotels", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),
  hotelId: uuid("hotel_id").references(() => hotels.id, {
    onDelete: "cascade",
  }),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const bookingOptionalTours = pgTable("booking_optional_tours", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  optionalActivities: jsonb("optionalActivities")
    .array()
    .$type<(SelectActivities & { date?: Date })[]>()
    .default([])
    .notNull(),
  representatives: jsonb("representatives")
    .array()
    .$type<SelectRepresentatives[]>()
    .default([])
    .notNull(),
  pax: integer("pax"),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),
  currency: text("currency"),
  price: integer("price"),
  files: jsonb("files").array().$type<{ url?: string; name?: string }[]>(),
  done: boolean("done").default(false).notNull(),
});

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  representatives: jsonb("representatives")
    .array()
    .$type<SelectRepresentatives[]>()
    .notNull(),
  files: jsonb("files")
    .array()
    .$type<{ url?: string; name?: string }[]>()
    .notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  representatives: jsonb("representatives")
    .array()
    .$type<SelectRepresentatives[]>()
    .notNull(),
  files: jsonb("files")
    .array()
    .$type<{ url?: string; name?: string }[]>()
    .notNull(),
});

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  countryId: uuid("country_id").references(() => countries.id, {
    onDelete: "cascade",
  }),
});

export const bookingsRelations = relations(bookings, ({ many, one }) => ({
  reservations: many(reservations),
  bookingTour: one(bookingTours),
  bookingHotels: many(bookingHotels),
  bookingOptionalTours: many(bookingOptionalTours),
  surveys: many(surveys),
  reviews: many(reviews),
}));

export const guidesRelations = relations(guides, ({ one }) => ({
  country: one(countries, {
    fields: [guides.countryId],
    references: [countries.id],
  }),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  hotels: many(hotels),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
}));

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

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
  country: one(countries, {
    fields: [hotels.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [hotels.cityId],
    references: [cities.id],
  }),
  bookingHotels: many(bookingHotels),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  itineraries: many(itineraries),
}));

export const bookingToursRelations = relations(
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

export const representativesRelations = relations(
  representatives,
  ({ one }) => ({
    country: one(countries, {
      fields: [representatives.countryId],
      references: [countries.id],
    }),
  }),
);

export const bookingHotelsRelations = relations(bookingHotels, ({ one }) => ({
  hotel: one(hotels, {
    fields: [bookingHotels.hotelId],
    references: [hotels.id],
  }),
  booking: one(bookings, {
    fields: [bookingHotels.bookingId],
    references: [bookings.id],
  }),
}));

export const bookingOptionalToursRelations = relations(
  bookingOptionalTours,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [bookingOptionalTours.bookingId],
      references: [bookings.id],
    }),
  }),
);

export const surveysRelations = relations(surveys, ({ one }) => ({
  booking: one(bookings, {
    fields: [surveys.bookingId],
    references: [bookings.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

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
export type SelectBookingHotels = typeof bookingHotels.$inferSelect;
export type SelectSurveys = typeof surveys.$inferSelect;
export type SelectReviews = typeof reviews.$inferSelect;

export type SelectBookingOptionalTours =
  typeof bookingOptionalTours.$inferSelect;

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
export type SelectBookingHotel = SelectBookingHotels & {
  hotel: SelectHotels[];
};
export type SelectBookingWithItineraries = SelectBookings & {
  bookingTour: SelectBookingToursWithItineraries;
  reservations: SelectReservations[];
};

export type Bookings = SelectBookings & {
  bookingTour: SelectBookingTours & {
    itineraries: SelectBookingItineraries[];
  };
  bookingHotels: (SelectBookingHotels & { hotel: SelectHotels })[];
  reservations: SelectReservations[];
  surveys: SelectSurveys[];
  reviews: SelectReviews[];
};
