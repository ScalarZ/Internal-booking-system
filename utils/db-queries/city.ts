"use server";

import { db } from "@/drizzle/db";
import { SelectCities, cities } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCities() {
  return db.query.cities.findMany({ with: { country: true } });
}

export async function addCity(city: Omit<SelectCities, "id">) {
  await db.insert(cities).values(city);
  revalidatePath("/create/cities");
}

export async function updateCity(city: SelectCities) {
  await db
    .update(cities)
    .set({ name: city.name, countryId: city.countryId })
    .where(eq(cities.id, city.id));
  revalidatePath("/create/cities");
}

export async function deleteCity(city: { id: string }) {
  await db.delete(cities).where(eq(cities.id, city.id));
  revalidatePath("/create/cities");
}

export async function getCountryCities(cityId: string) {
  return await db.select().from(cities).where(eq(cities.countryId, cityId));
}
