"use server";

import { db } from "@/drizzle/db";
import { SelectReservations, reservations } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getReservations() {
  return db.select().from(reservations).orderBy(desc(reservations.updatedAt));
}

export async function addReservations(
  reservation: Omit<
    SelectReservations,
    "id" | "createdAt" | "updatedAt" | "finalPrice"
  >[],
) {
  await db.insert(reservations).values(reservation).returning();
  revalidatePath("/reservations");
}

export async function updateReservation(
  reservation: Omit<SelectReservations, "createdAt" | "updatedAt">,
) {
  await db
    .update(reservations)
    .set(reservation)
    .where(eq(reservations.id, reservation.id));
  revalidatePath("/reservations");
}

export async function deleteReservation(reservationId: number) {
  await db.delete(reservations).where(eq(reservations.id, reservationId));
  revalidatePath("/reservations");
}
