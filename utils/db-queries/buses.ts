"use server";

import { db } from "@/drizzle/db";
import { SelectBuses, buses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBuses() {
  return db.query.buses.findMany({ with: { country: true } });
}

export async function addBus(bus: Omit<SelectBuses, "id" | "createdAt">) {
  await db.insert(buses).values(bus);
  revalidatePath("/create/buses");
}

export async function updateBus(bus: Omit<SelectBuses, "createdAt">) {
  await db
    .update(buses)
    .set({ name: bus.name, countryId: bus.countryId })
    .where(eq(buses.id, bus.id));
  revalidatePath("/create/buses");
}

export async function deleteBus(bus: { id: number }) {
  await db.delete(buses).where(eq(buses.id, bus.id));
  revalidatePath("/create/buses");
}

export async function getCountryBuses(countryId: string) {
  return await db.select().from(buses).where(eq(buses.countryId, countryId));
}
