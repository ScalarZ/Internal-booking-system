"use server";

import { db } from "@/drizzle/db";
import { SelectBookings, bookings } from "@/drizzle/schema";
import { and, between, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getBookings() {
  return db.select().from(bookings);
}

export async function filterBookings(filters: BookingFilters) {
  const query = db.select().from(bookings);

  const eqList: ReturnType<typeof eq>[] = [];

  if (filters.id)
    eqList.push(
      eq(
        bookings.id,
        uuidV4Regex.test(filters.id)
          ? filters.id
          : "00000000-0000-4000-8000-000000000000",
      ),
    );
  if (filters.country) eqList.push(eq(bookings.country, filters.country));
  if (filters.arrivalDate?.from && filters.arrivalDate?.to)
    eqList.push(
      between(
        bookings.arrivalDate,
        filters.arrivalDate.from,
        filters.arrivalDate.to,
      ),
    );
  if (filters.departureDate?.from && filters.departureDate?.to)
    eqList.push(
      between(
        bookings.departureDate,
        filters.departureDate.from,
        filters.departureDate.to,
      ),
    );
  return query.where(and(...eqList));
}

export async function addBookings(
  booking: Omit<SelectBookings, "id" | "createdAt" | "updatedAt">,
) {
  await db.insert(bookings).values(booking);
  revalidatePath("/bookings");
}

export async function updateBooking(
  booking: Omit<SelectBookings, "createdAt" | "updatedAt">,
) {
  await db.update(bookings).set(booking).where(eq(bookings.id, booking.id));
  revalidatePath("/bookings");
}

export async function deleteBooking(bookingId: string) {
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/bookings");
}
