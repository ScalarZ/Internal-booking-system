"use server";

import { db } from "@/drizzle/db";
import {
  bookingOptionalTours,
  itineraries,
  SelectItineraries,
  SelectTours,
  tours,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTours() {
  return db.query.tours.findMany({ with: { itineraries: true } });
}

export async function getToursWithBooking() {
  return await db.query.bookingOptionalTours.findMany({
    with: {
      booking: {
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
        },
      },
    },
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
}

export async function addTour({
  tour,
  tourItineraries,
}: {
  tour: Omit<SelectTours, "id">;
  tourItineraries: Omit<
    SelectItineraries,
    "id" | "createdAt" | "updatedAt" | "tourId"
  >[];
}) {
  "use server";
  const tourRow = await db.insert(tours).values(tour).returning();
  const tourId = tourRow[0].id;
  await db
    .insert(itineraries)
    .values(tourItineraries.map((itinerary) => ({ ...itinerary, tourId })));
  revalidatePath("/create/tours");
}

export async function updateTour({
  tour,
  tourItineraries,
}: {
  tour: SelectTours;
  tourItineraries: Omit<SelectItineraries, "id" | "createdAt" | "updatedAt">[];
}) {
  const tourRow = await db
    .update(tours)
    .set(tour)
    .where(eq(tours.id, tour.id))
    .returning();
  const tourId = tourRow[0].id;

  await db.delete(itineraries).where(eq(itineraries.tourId, tourId));
  await db
    .insert(itineraries)
    .values(tourItineraries.map((itinerary) => ({ ...itinerary, tourId })));

  revalidatePath("/create/tours");
}

export async function deleteTour(tour: { id: string }) {
  await db.delete(tours).where(eq(tours.id, tour.id));
  revalidatePath("/create/tours");
}

export async function getTourCountries(tourId: string) {
  return db.query.tours.findMany({
    with: { itineraries: true },
    where: ({ id }) => eq(id, tourId),
  });
}

export async function updateDoneStatus(tour: { id: number; done: boolean }) {
  await db
    .update(bookingOptionalTours)
    .set({ done: tour.done })
    .where(eq(bookingOptionalTours.id, tour.id));
  revalidatePath("/orders");
}
