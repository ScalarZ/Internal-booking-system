"use server";

import { db } from "@/drizzle/db";
import {
  SelectBookings,
  SelectReservations,
  bookings,
  notifications,
} from "@/drizzle/schema";
import { and, arrayContains, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addReservations, deleteBookingReservations } from "./reservation";

export async function getBookings() {
  return await db.query.bookings.findMany({ with: { reservations: true } });
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
    with: { reservations: true },
    where() {
      return and(...whereList);
    },
    orderBy({ updatedAt }) {
      return desc(updatedAt);
    },
  });
}

export async function addBookings(
  booking: Omit<SelectBookings, "id" | "createdAt" | "updatedAt">,
  reservations: Omit<
    SelectReservations,
    "id" | "createdAt" | "updatedAt" | "bookingId" | "finalPrice"
  >[],
  passports: { url: string; name: string }[],
  domesticFlightsTickets: string[],
  internationalFlightsTickets: string[],
) {
  const row = await db
    .insert(bookings)
    .values({
      ...booking,
      passports,
      domesticFlights: booking.domesticFlights?.map((props, i) => ({
        ...props,
        url: domesticFlightsTickets[i],
      })),
      internationalFlights: booking.internationalFlights?.map(
        (props, i) => ({
          ...props,
          url: internationalFlightsTickets[i],
        }),
      ),
    })
    .returning();

  if (reservations?.length)
    await addReservations(
      reservations?.map((reservation) => ({
        ...reservation,
        bookingId: row[0].id,
      })),
    );
  return await db.insert(notifications).values({
    type: "booking",
    message: "new booking has been added with id " + row[0].id,
  });
  // revalidatePath("/bookings");
}

export async function updateBooking(
  booking: Omit<SelectBookings, "createdAt" | "updatedAt" | "passports">,
  reservations: Omit<
    SelectReservations,
    "id" | "createdAt" | "updatedAt" | "bookingId"
  >[],
  passports: { url: string; name: string }[],
) {
  const res = await Promise.all([
    db
      .update(bookings)
      .set({ ...booking, passports })
      .where(eq(bookings.id, booking.id)),
    deleteBookingReservations(booking.id),
  ]);
  if (reservations.length)
    await addReservations(
      reservations.map((reservation) => ({
        ...reservation,
        bookingId: booking.id,
      })),
    );
  if (reservations.every(({ finalPrice }) => finalPrice))
    await db.insert(notifications).values({
      type: "reservation",
      message: "Booking with id " + booking.id + " has received a final price",
    });
  return res;
}

export async function deleteBooking(bookingId: number) {
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/bookings");
}
