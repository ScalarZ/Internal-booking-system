"use server";

import { db } from "@/drizzle/db";
import {
  SelectBookings,
  SelectReservations,
  bookings,
  notifications,
} from "@/drizzle/schema";
import { and, arrayContains, desc, eq, gte, like, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addReservations, deleteBookingReservations } from "./reservation";

export async function getBookings() {
  return await db.query.bookings.findMany({ with: { reservations: true } });
}

export async function filterBookings(filters: BookingFilters) {
  const query = db.select().from(bookings);

  const whereList: ReturnType<typeof eq>[] = [];

  if (filters.id) whereList.push(like(bookings.id, `%${filters.id}%`));

  if (filters.country)
    whereList.push(arrayContains(bookings.countries, [filters.country]));

  if (filters.dateRange?.from && filters.dateRange?.to)
    whereList.push(
      gte(bookings.arrivalDate, filters.dateRange?.from),
      lte(bookings.departureDate, filters.dateRange?.to),
    );

  return query.where(and(...whereList)).orderBy(desc(bookings.updatedAt));
}

export async function addBookings(
  booking: Omit<SelectBookings, "id" | "createdAt" | "updatedAt">,
  reservations: Omit<
    SelectReservations,
    "id" | "createdAt" | "updatedAt" | "bookingId" | "finalPrice"
  >[],
  passports: { image: string; touristName: string }[],
  domesticFlightsTickets: string[],
) {
  console.log(passports, domesticFlightsTickets);

  const row = await db
    .insert(bookings)
    .values({
      ...booking,
      passports,
      domesticFlights: booking.domesticFlights?.map((props, i) => ({
        ...props,
        url: domesticFlightsTickets[i],
      })),
    })
    .returning();

  if (reservations.length)
    await addReservations(
      reservations?.map((reservation) => ({
        ...reservation,
        bookingId: row[0].id,
      })),
    );
  await db.insert(notifications).values({
    type: "booking",
    message: "new booking has been added with id " + row[0].id,
  });
  revalidatePath("/bookings");
}

export async function updateBooking(
  booking: Omit<SelectBookings, "createdAt" | "updatedAt" | "passports">,
  reservations: Omit<
    SelectReservations,
    "id" | "createdAt" | "updatedAt" | "bookingId"
  >[],
) {
  const res = await Promise.all([
    db.update(bookings).set(booking).where(eq(bookings.id, booking.id)),
    deleteBookingReservations(booking.id),
  ]);
  await addReservations(
    reservations?.map((reservation) => ({
      ...reservation,
      bookingId: booking.id,
    })),
  );
  if (reservations.every(({ finalPrice }) => finalPrice))
    await db.insert(notifications).values({
      type: "reservation",
      message: "Booking with id " + booking.id + " has received a final price",
    });
  revalidatePath("/bookings");
}

export async function deleteBooking(bookingId: number) {
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/bookings");
}
