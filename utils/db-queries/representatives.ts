"use server";

import { db } from "@/drizzle/db";
import { SelectRepresentatives, representatives } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRepresentatives() {
  return db.query.representatives.findMany({
    with: { country: true },
  });
}

export async function addRepresentative(
  representative: Omit<SelectRepresentatives, "id">,
) {
  await db.insert(representatives).values(representative);
  revalidatePath("/create/representatives");
}

export async function updateRepresentative(
  representative: SelectRepresentatives,
) {
  await db
    .update(representatives)
    .set({ name: representative.name, countryId: representative.countryId })
    .where(eq(representatives.id, representative.id));
  revalidatePath("/create/representatives");
}

export async function deleteRepresentative(representative: { id: string }) {
  await db
    .delete(representatives)
    .where(eq(representatives.id, representative.id));
  revalidatePath("/create/representatives");
}
