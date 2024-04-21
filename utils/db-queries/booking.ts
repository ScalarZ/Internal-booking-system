"use server";

import { db } from "@/drizzle/db";
import { SelectBookings, bookings } from "@/drizzle/schema";
import { and, arrayContains, between, desc, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getBookings() {
  return db.select().from(bookings).orderBy(desc(bookings.updatedAt));
}

export async function filterBookings(filters: BookingFilters) {
  const query = db.select().from(bookings);

  const whereList: ReturnType<typeof eq>[] = [];

  if (filters.id)
    whereList.push(
      eq(
        bookings.id,
        uuidV4Regex.test(filters.id)
          ? filters.id
          : "00000000-0000-4000-8000-000000000000",
      ),
    );

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
  booking: Omit<
    SelectBookings,
    "id" | "createdAt" | "updatedAt" | "cities" | "activities" | "guide"
  >,
) {
  await db.insert(bookings).values(booking);
  revalidatePath("/bookings");
}

export async function updateBooking(
  booking: Omit<
    SelectBookings,
    "createdAt" | "updatedAt" | "cities" | "activities" | "guide"
  >,
) {
  await db.update(bookings).set(booking).where(eq(bookings.id, booking.id));
  revalidatePath("/bookings");
}

export async function deleteBooking(bookingId: string) {
  await db.delete(bookings).where(eq(bookings.id, bookingId));
  revalidatePath("/bookings");
}
