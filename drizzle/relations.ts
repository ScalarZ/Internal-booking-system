import { relations } from "drizzle-orm";
import {
  activities,
  bookingHotels,
  bookingItineraries,
  bookingOptionalTours,
  bookings,
  bookingTours,
  cities,
  countries,
  guides,
  hotels,
  itineraries,
  representatives,
  reservations,
  tours,
} from "./schema";

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

export const bookingsRelations = relations(bookings, ({ many, one }) => ({
  reservations: many(reservations),
  bookingTour: one(bookingTours),
  bookingHotels: many(bookingHotels),
  bookingOptionalTours: many(bookingOptionalTours),
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
