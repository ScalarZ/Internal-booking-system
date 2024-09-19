"use server";

import { db } from "@/drizzle/db";
import {
  SelectBookingItineraries,
  SelectBookingOptionalTours,
  SelectBookingTours,
  SelectBookingWithItineraries,
  SelectBookings,
  SelectHotels,
  SelectReservations,
  SelectSurveys,
  bookingHotels,
  bookingItineraries,
  bookingOptionalTours,
  bookingTours,
  bookings,
  notifications,
  reviews,
  surveys,
} from "@/drizzle/schema";
import {
  and,
  arrayContains,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addReservations, deleteBookingReservations } from "./reservation";
import { addDays, format, startOfWeek } from "date-fns";

export async function getBookings() {
  return await db.query.bookings.findMany({
    with: {
      reservations: true,
      bookingTour: {
        with: { itineraries: true },
      },
      bookingHotels: {
        with: {
          hotel: true,
        },
      },
      reviews: true,
      surveys: true,
    },
    orderBy: ({ updatedAt }, { desc }) => desc(updatedAt),
  });
}
export async function getBooking(bookingId: number) {
  return await db.query.bookings.findFirst({
    with: { reservations: true },
    where: ({ id }) => eq(id, bookingId),
  });
}

export async function filterBookings(filters: BookingFilters) {
  const whereList: ReturnType<typeof eq>[] = [];
  if (filters.id)
    whereList.push(ilike(bookings.internalBookingId, `%${filters.id}%`));

  if (filters.country)
    whereList.push(arrayContains(bookings.countries, [filters.country]));

  if (filters.dateRange?.from && filters.dateRange?.to)
    whereList.push(
      gte(
        bookings.arrivalDate,
        new Date(
          filters.dateRange?.from.toLocaleString(undefined, {
            timeZone: "Europe/Paris",
          }),
        ),
      ),
      lte(
        bookings.departureDate,
        new Date(
          filters.dateRange?.to.toLocaleString(undefined, {
            timeZone: "Europe/Paris",
          }),
        ),
      ),
    );

  return db.query.bookings.findMany({
    with: {
      reservations: true,
      bookingTour: {
        with: { itineraries: true },
      },
      bookingHotels: {
        with: {
          hotel: true,
        },
      },
      reviews: true,
      surveys: true,
    },
    orderBy: ({ updatedAt }, { desc }) => desc(updatedAt),
    where() {
      return and(...whereList);
    },
  });
}

export async function addBookings(
  booking: Omit<SelectBookings, "id" | "createdAt" | "updatedAt">,
  bookingTour: Omit<
    SelectBookingTours & {
      itineraries: Omit<
        SelectBookingItineraries,
        "guide" | "createdAt" | "updatedAt"
      >[];
    },
    "id" | "bookingId"
  >,
  hotels: SelectHotels[],
  lists: {
    reservationsList: Omit<
      SelectReservations,
      "id" | "createdAt" | "updatedAt"
    >[];
    passportPaths: { url: string; name: string }[];
    domesticFlightsTicketPaths: Ticket[][];
    internationalFlightTicketsPaths: Ticket[][];
  },
) {
  const [bookingRow] = await db
    .insert(bookings)
    .values({
      ...booking,
      passports: lists.passportPaths,
      domesticFlights: booking.domesticFlights?.map((props, i) => ({
        ...props,
        urls: lists.domesticFlightsTicketPaths[i],
      })),
      internationalFlights: booking.internationalFlights?.map((props, i) => ({
        ...props,
        urls: lists.internationalFlightTicketsPaths[i],
      })),
    })
    .returning();

  const [bookingTourRow] = await db
    .insert(bookingTours)
    .values({ bookingId: bookingRow.id, ...bookingTour })
    .returning();

  if (hotels.length)
    await db.insert(bookingHotels).values(
      hotels.map((hotel) => ({
        hotelId: hotel.id,
        bookingId: bookingRow.id,
      })),
    );

  if (bookingTour.itineraries.length)
    await db.insert(bookingItineraries).values(
      bookingTour.itineraries.map(({ id, ...itinerary }) => ({
        ...itinerary,
        tourId: bookingTourRow.id,
      })),
    );
  if (lists.reservationsList?.length)
    await addReservations(
      lists.reservationsList?.map((reservation) => ({
        ...reservation,
        bookingId: bookingRow.id,
      })),
    );
  // return await db.insert(notifications).values({
  //   type: "booking",
  //   message: "new booking has been added with id " + row[0].id,
  // });
  revalidatePath("/bookings");
}

export async function updateBooking(
  booking: Omit<SelectBookings, "createdAt" | "updatedAt" | "passports">,
  bookingTour: Omit<
    SelectBookingTours & {
      itineraries: Omit<
        SelectBookingItineraries,
        "guide" | "createdAt" | "updatedAt"
      >[];
    },
    "bookingId"
  >,
  hotels: SelectHotels[],
  lists: {
    reservationsList: Omit<
      SelectReservations,
      "id" | "createdAt" | "updatedAt"
    >[];
    passportPaths: { url: string; name: string }[];
    domesticFlightsTicketPaths: Ticket[][];
    internationalFlightTicketsPaths: Ticket[][];
  },
) {
  const res = await Promise.allSettled([
    db
      .update(bookings)
      .set({
        ...booking,
        passports: lists.passportPaths,
        domesticFlights: booking.domesticFlights?.map((props, i) => ({
          ...props,
          urls: lists.domesticFlightsTicketPaths[i],
        })),
        internationalFlights: booking.internationalFlights?.map((props, i) => ({
          ...props,
          urls: lists.internationalFlightTicketsPaths[i],
        })),
      })
      .where(eq(bookings.id, booking.id)),
    db
      .update(bookingTours)
      .set(bookingTour)
      .where(eq(bookingTours.id, bookingTour.id)),
    deleteBookingReservations(booking.id),
    deleteBookingTourItineraries(bookingTour.id),
    deleteBookingHotels(booking.id),
  ]);

  if (hotels.length)
    await db.insert(bookingHotels).values(
      hotels.map((hotel) => ({
        hotelId: hotel.id,
        bookingId: booking.id,
      })),
    );

  if (bookingTour.itineraries.length)
    await db.insert(bookingItineraries).values(
      bookingTour.itineraries.map(({ id, ...itinerary }) => ({
        ...itinerary,
        tourId: bookingTour.id,
      })),
    );

  if (lists.reservationsList?.length)
    await addReservations(
      lists.reservationsList.map((reservation) => ({
        ...reservation,
        bookingId: booking.id,
      })),
    );
  // if (lists.reservationsList.every(({ finalPrice }) => finalPrice))
  //   await db.insert(notifications).values({
  //     type: "reservation",
  //     message: "Booking with id " + booking.id + " has received a final price",
  //   });
  revalidatePath("/bookings");
}

export async function deleteBooking(bookingId: number) {
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/bookings");
}

export async function deleteBookingTourItineraries(bookingTourId: string) {
  return await db
    .delete(bookingItineraries)
    .where(eq(bookingItineraries.tourId, bookingTourId));
}

export async function deleteBookingHotels(bookingId: number) {
  return await db
    .delete(bookingHotels)
    .where(eq(bookingHotels.bookingId, bookingId));
}

export async function addBookingOptionalTour(
  value: Omit<SelectBookingOptionalTours, "id" | "createdAt" | "done">,
) {
  return await db.insert(bookingOptionalTours).values(value).returning();
}

export async function addSurvey(
  value: Omit<SelectSurveys, "id" | "createdAt">,
) {
  await db.insert(surveys).values(value).returning();
  revalidatePath("/search-screen");
}

export async function addReview(
  value: Omit<SelectSurveys, "id" | "createdAt">,
) {
  await db.insert(reviews).values(value).returning();
  revalidatePath("/search-screen");
}

export async function getWeeklyItineraries(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  return (await db.execute(sql`
    WITH itinerary_data AS (
        SELECT
            booking_tours.booking_id,
            booking_tours.id AS tour_id,
            json_agg(
                json_build_object(
                    'id', booking_itineraries.id,
                    'day', booking_itineraries.day,
                    'activities', booking_itineraries.activities,
                    'optionalActivities', booking_itineraries.optional_activities,
                    'cities', booking_itineraries.cities,
                    'guide', booking_itineraries.guide,
                    'dayNumber', booking_itineraries.day_number,
                    'tourId', booking_itineraries.tour_id
                )
            ) AS itineraries
        FROM
            booking_tours
        JOIN
            booking_itineraries ON booking_itineraries.tour_id = booking_tours.id
        WHERE
            booking_itineraries.day >= ${format(weekStart, "yyyy-MM-dd")}
            AND booking_itineraries.day < ${format(addDays(weekStart, 7), "yyyy-MM-dd")}
        GROUP BY
            booking_tours.booking_id, booking_tours.id
    )
    SELECT
        bookings.*,
        bookings.internal_booking_id AS "internalBookingId",
        json_build_object(
            'id', itinerary_data.tour_id,
            'itineraries', itinerary_data.itineraries
        ) AS "bookingTour"
    FROM
        bookings
    JOIN
        itinerary_data ON bookings.id = itinerary_data.booking_id;
    `)) as SelectBookingWithItineraries[];
}

export async function updateBookingItineraryGuide({
  itineraryId,
  guide,
}: {
  itineraryId: number;
  guide: string | null;
}) {
  return await db
    .update(bookingItineraries)
    .set({ guide })
    .where(eq(bookingItineraries.id, itineraryId));
}
