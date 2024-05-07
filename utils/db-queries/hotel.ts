"use server";

import { db } from "@/drizzle/db";
import { SelectHotels, hotels } from "@/drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getHotels() {
  return db.query.hotels.findMany({
    with: { country: true, city: true },
  });
}

export async function addHotel(hotel: Omit<SelectHotels, "id">) {
  await db.insert(hotels).values({
    name: hotel.name,
    countryId: hotel.countryId,
    cityId: hotel.cityId,
  });
  revalidatePath("/create/hotels");
}

export async function updateHotel(hotel: SelectHotels) {
  await db
    .update(hotels)
    .set({
      name: hotel.name,
      countryId: hotel.countryId,
      cityId: hotel.cityId,
    })
    .where(eq(hotels.id, hotel.id));
  revalidatePath("/create/hotels");
}

export async function deleteHotel(hotel: { id: string }) {
  await db.delete(hotels).where(eq(hotels.id, hotel.id));
  revalidatePath("/create/hotels");
}

export async function getCityHotels({
  countryId,
  cityId,
}: {
  countryId: string;
  cityId: string;
}) {
  return await db
    .select()
    .from(hotels)
    .where(and(eq(hotels.countryId, countryId), eq(hotels.cityId, cityId)));
}

export async function getCitiesHotels(citiesId: string[]) {
  return db.select().from(hotels).where(inArray(hotels.cityId, citiesId));
}
