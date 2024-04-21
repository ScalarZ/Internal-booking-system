"use server";

import { db } from "@/drizzle/db";
import {
  SelectActivities,
  SelectCities,
  SelectCountries,
  SelectTours,
  tours,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTours() {
  return db.select().from(tours);
}

export async function addTour(tour: {
  name: string;
  countries: SelectCountries[];
  itinerary: Itinerary[];
}) {
  "use server";
  await db.insert(tours).values(tour);
  revalidatePath("/create/activities");
}

export async function updateTour(tour: SelectTours) {
  await db
    .update(tours)
    .set({
      name: tour.name,
      itinerary: tour.itinerary,
      countries: tour.countries,
    })
    .where(eq(tours.id, tour.id));
  revalidatePath("/create/tours");
}

export async function deleteTour(tour: { id: string }) {
  await db.delete(tours).where(eq(tours.id, tour.id));
  revalidatePath("/create/tours");
}

export async function getTourCities(tourName: string) {
  return db.select().from(tours).where(eq(tours.name, tourName));
}
