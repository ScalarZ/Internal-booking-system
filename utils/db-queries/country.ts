"use server";

import { db } from "@/drizzle/db";
import { SelectCountries, countries } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCountries() {
  return db.select().from(countries);
}

export async function addCountry(country: Omit<SelectCountries, "id">) {
  await db.insert(countries).values(country);
  revalidatePath("/create/countries");
}

export async function updateCountry(country: SelectCountries) {
  await db
    .update(countries)
    .set({ name: country.name })
    .where(eq(countries.id, country.id));
  revalidatePath("/create/countries");
}

export async function deleteCountry(country: { id: string }) {
  await db.delete(countries).where(eq(countries.id, country.id));
  revalidatePath("/create/countries");
}
