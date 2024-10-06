"use server";

import { db } from "@/drizzle/db";
import {
  Bookings,
  SelectBookingItineraries,
  SelectBookingOptionalTours,
  SelectBookingTours,
  SelectBookings,
  SelectHotels,
  SelectReservations,
  SelectSurveys,
  bookingHotels,
  bookingItineraries,
  bookingOptionalTours,
  bookingTours,
  bookings,
  reviews,
  surveys,
} from "@/drizzle/schema";
import { and, arrayContains, eq, gte, ilike, lte, sql } from "drizzle-orm";
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
export async function getBooking(bookingId: string) {
  return await db.query.bookings.findFirst({
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
    where: ({ internalBookingId }) => eq(internalBookingId, bookingId),
  });
}

export async function filterBookings(filters: BookingFilters) {
  const whereList: ReturnType<typeof eq>[] = [];
  if (filters.id)
    whereList.push(ilike(bookings.internalBookingId, `%${filters.id}%`));

  if (filters.country)
    whereList.push(arrayContains(bookings.countries, [filters.country]));

  if (filters.dateRange?.from && filters.dateRange?.to) {
    // Convert dates to UTC and adjust for the time zone difference
    const fromDate = new Date(filters.dateRange.from);

    const toDate = new Date(filters.dateRange.to);

    whereList.push(
      gte(bookings.arrivalDate, fromDate),
      lte(bookings.departureDate, toDate),
    );
  }

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

type ExcludedColumn = "createdAt" | "updatedAt";
export async function addBookings(
  booking: Omit<SelectBookings, "id" | ExcludedColumn>,
  bookingTour: Omit<
    SelectBookingTours & {
      itineraries: Omit<
        SelectBookingItineraries,
        "guide" | "optionalGuide" | "createdAt" | "updatedAt"
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
  revalidatePath("/bookings");
}

export async function updateBooking(
  booking: Omit<SelectBookings, ExcludedColumn | "passports">,
  bookingTour: Omit<
    SelectBookingTours & {
      itineraries: Omit<
        SelectBookingItineraries,
        "guide" | "optionalGuide" | "createdAt" | "updatedAt"
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
  await Promise.allSettled([
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
        start: reservation.start ? new Date(reservation.start) : null,
        end: reservation.end ? new Date(reservation.end) : null,
      })),
    );
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
                    'optionalGuide', booking_itineraries.optional_guide,
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
    ),
    check_itineraries_guide AS (
      SELECT 
          bt.booking_id,
          CASE 
            WHEN COUNT(bi.id) = 0 THEN 'red' 
            WHEN COUNT(bi.id) = SUM(CASE WHEN bi.guide IS NOT NULL THEN 1 ELSE 0 END) THEN 'green'  
            WHEN SUM(CASE WHEN bi.guide IS NOT NULL THEN 1 ELSE 0 END) = 0 THEN 'red'  
            ELSE 'yellow' 
          END AS guide_status
      FROM   
          booking_tours bt
      LEFT JOIN 
          booking_itineraries bi ON bt.id = bi.tour_id
      GROUP BY 
          bt.booking_id
    ),
    reservation_data AS (
      SELECT
        reservations.booking_id,
        json_agg(
          json_build_object(
            'id',
            reservations.id,
            'hotels',
            reservations.hotels
          )
        ) AS bookingReservations
      FROM
        reservations
      GROUP BY
        reservations.booking_id
    )
    SELECT
        bookings.*,
        bookings.internal_booking_id AS "internalBookingId",
        json_build_object(
          'id', itinerary_data.tour_id,
          'itineraries', itinerary_data.itineraries
          ) AS "bookingTour",
          reservation_data.bookingReservations AS reservations,
          check_itineraries_guide.guide_status
    FROM
        bookings
    JOIN
        itinerary_data ON bookings.id = itinerary_data.booking_id
    JOIN
        reservation_data ON bookings.id = reservation_data.booking_id
    JOIN check_itineraries_guide ON bookings.id = check_itineraries_guide.booking_id;
    `)) as (Bookings & { guide_status: "red" | "yellow" | "green" })[];
}

export async function getFilteredWeeklyItineraries(date: Date, filters: any) {
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
                    'optionalGuide', booking_itineraries.optional_guide,
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
            ${
              filters.city.name && filters.city.dateRange
                ? sql`AND EXISTS (
                        SELECT 1
                        FROM unnest(booking_itineraries.cities) AS city
                        WHERE city->>'name' = ${filters.city.name}
                      )
                      AND booking_itineraries.day >= ${filters.city.dateRange.from} 
                      AND booking_itineraries.day < ${filters.city.dateRange.to}`
                : sql``
            }
        GROUP BY
            booking_tours.booking_id, booking_tours.id
    ),
    check_itineraries_guide AS (
      SELECT 
          bt.booking_id,
          CASE 
            WHEN COUNT(bi.id) = 0 THEN 'red' 
            WHEN COUNT(bi.id) = SUM(CASE WHEN bi.guide IS NOT NULL THEN 1 ELSE 0 END) THEN 'green'  
            WHEN SUM(CASE WHEN bi.guide IS NOT NULL THEN 1 ELSE 0 END) = 0 THEN 'red'  
            ELSE 'yellow' 
          END AS guide_status
      FROM   
          booking_tours bt
      LEFT JOIN 
          booking_itineraries bi ON bt.id = bi.tour_id
      GROUP BY 
          bt.booking_id
    ),
    reservation_data AS (
      SELECT
        reservations.booking_id,
        json_agg(
          json_build_object(
            'id',
            reservations.id,
            'hotels',
            reservations.hotels
          )
        ) AS bookingReservations
      FROM
        reservations
      GROUP BY
        reservations.booking_id
    )
    SELECT
        bookings.*,
        bookings.internal_booking_id AS "internalBookingId",
        json_build_object(
          'id', itinerary_data.tour_id,
          'itineraries', itinerary_data.itineraries
          ) AS "bookingTour",
          reservation_data.bookingReservations AS reservations,
          check_itineraries_guide.guide_status
    FROM
        bookings
    JOIN
        itinerary_data ON bookings.id = itinerary_data.booking_id
    JOIN
        reservation_data ON bookings.id = reservation_data.booking_id
    JOIN check_itineraries_guide ON bookings.id = check_itineraries_guide.booking_id;
    `)) as (Bookings & { guide_status: "red" | "yellow" | "green" })[];
}

export async function updateBookingItineraryGuide({
  itineraryId,
  guide,
  optional = false,
}: {
  itineraryId: number;
  guide: string | null;
  optional?: boolean;
}) {
  return await db
    .update(bookingItineraries)
    .set(!optional ? { guide } : { optionalGuide: guide })
    .where(eq(bookingItineraries.id, itineraryId));
}

export async function getDomesticDepartures(date: string, city?: string) {
  return (await db.execute(sql`
   WITH departure_bookings AS (
     SELECT
       r.*,
       b.*,
       (
         SELECT domestic_flights
         FROM unnest(b.domestic_flights) AS domestic_flights
         WHERE (domestic_flights ->> 'departure')::jsonb ->> 'departureDate' = ${date}
         LIMIT 1
       )::jsonb AS domestic_flight
     FROM bookings b
     INNER JOIN reservations r ON r.booking_id = b.id
     WHERE EXISTS (
       SELECT 1
       FROM unnest(b.domestic_flights) AS domestic_flights
       WHERE (domestic_flights ->> 'departure')::jsonb ->> 'departureDate' = ${date}
       ${city ? sql`AND (domestic_flights ->> 'departure')::jsonb ->> 'from' = ${city}` : sql``}
     )
   )
   SELECT
     db.booking_id AS id,
     db.internal_booking_id AS "internalBookingId",
     db.pax,
     (db.domestic_flight::jsonb->>'id')::text AS "domesticId", 
     jsonb_set(
       (db.domestic_flight::jsonb ->> 'departure')::jsonb,
       '{from}',
       to_jsonb(
         concat(
           (db.domestic_flight::jsonb ->> 'departure')::jsonb ->> 'from',
           '-',
           db.hotels[1]
         )
       )
     ) AS departure
   FROM departure_bookings db
   WHERE ((db.domestic_flight::jsonb ->> 'departure')::jsonb ->> 'departureDate')::date = "end";
`)) as (Bookings & { departure: DepartureInfo; domesticId: string })[];
}

export async function updateDomesticDeparturesRepresentative(
  bookingId: number,
  domesticId: string,
  representative: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{departure,representative}', 
              to_jsonb(${representative}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function updateDomesticDeparturesBus(
  bookingId: number,
  domesticId: string,
  bus: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{departure,bus}', 
              to_jsonb(${bus}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function updateDomesticDeparturesDriver(
  bookingId: number,
  domesticId: string,
  driver: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{departure,driver}', 
              to_jsonb(${driver}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function updateDomesticDeparturesNote(
  bookingId: number,
  domesticId: string,
  note: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{departure,note}', 
              to_jsonb(${note}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function getDomesticArrivals(date: string, city?: string) {
  return (await db.execute(sql`
   WITH arrival_bookings AS (
     SELECT
       r.*,
       b.*,
       (
         SELECT domestic_flights
         FROM unnest(b.domestic_flights) AS domestic_flights
         WHERE (domestic_flights ->> 'arrival')::jsonb ->> 'arrivalDate' = ${date}
         LIMIT 1
       )::jsonb AS domestic_flight
     FROM bookings b
     INNER JOIN reservations r ON r.booking_id = b.id
     WHERE EXISTS (
       SELECT 1
       FROM unnest(b.domestic_flights) AS domestic_flights
       WHERE (domestic_flights ->> 'arrival')::jsonb ->> 'arrivalDate' = ${date}
       ${city ? sql`AND (domestic_flights ->> 'arrival')::jsonb ->> 'to' = ${city}` : sql``}
     )
   )
   SELECT
     db.booking_id AS id,
     db.internal_booking_id AS "internalBookingId",
     db.pax,
     (db.domestic_flight::jsonb->>'id')::text AS "domesticId", 
     jsonb_set(
       (db.domestic_flight::jsonb ->> 'arrival')::jsonb,
       '{to}',
       to_jsonb(
         concat(
           (db.domestic_flight::jsonb ->> 'arrival')::jsonb ->> 'to',
           '-',
           db.hotels[1]
         )
       )
     ) AS arrival
   FROM arrival_bookings db
   WHERE ((db.domestic_flight::jsonb ->> 'arrival')::jsonb ->> 'arrivalDate')::date = "start";
`)) as (Bookings & { arrival: ArrivalInfo; domesticId: string })[];
}

export async function updateDomesticArrivalsRepresentative(
  bookingId: number,
  domesticId: string,
  representative: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{arrival,representative}', 
              to_jsonb(${representative}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function updateDomesticArrivalsBus(
  bookingId: number,
  domesticId: string,
  bus: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{arrival,bus}', 
              to_jsonb(${bus}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function updateDomesticArrivalsDriver(
  bookingId: number,
  domesticId: string,
  driver: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{arrival,driver}', 
              to_jsonb(${driver}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}

export async function updateDomesticArrivalsNote(
  bookingId: number,
  domesticId: string,
  note: string,
) {
  return await db.execute(sql`
    UPDATE bookings
    SET domestic_flights = (
      SELECT array_agg(
        CASE
          WHEN (flight ->> 'id')::text = ${domesticId} THEN 
            jsonb_set(
              flight::jsonb, 
              '{arrival,note}', 
              to_jsonb(${note}::text)
            )
          ELSE flight
        END
      ) 
      FROM unnest(domestic_flights) AS flight
    )
    WHERE id = ${bookingId}
  `);
}
