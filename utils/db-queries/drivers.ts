"use server";

import { db } from "@/drizzle/db";
import { SelectDrivers, drivers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDrivers() {
  return db.query.drivers.findMany({
    with: {
      country: true,
    },
  });
}

export async function addDriver(
  driver: Omit<SelectDrivers, "id" | "createdAt">,
) {
  await db.insert(drivers).values(driver);
  revalidatePath("/create/drivers");
}

export async function updateDriver(driver: Omit<SelectDrivers, "createdAt">) {
  await db
    .update(drivers)
    .set({ name: driver.name, countryId: driver.countryId })
    .where(eq(drivers.id, driver.id));
  revalidatePath("/create/drivers");
}

export async function deleteDriver(driver: { id: number }) {
  await db.delete(drivers).where(eq(drivers.id, driver.id));
  revalidatePath("/create/drivers");
}

export async function getCountryDrivers(countryId: string) {
  return await db
    .select()
    .from(drivers)
    .where(eq(drivers.countryId, countryId));
}
