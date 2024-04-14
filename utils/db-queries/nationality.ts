"use server";

import { db } from "@/drizzle/db";
import { SelectNationalities, nationalities } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNationalities() {
  return db.select().from(nationalities);
}

export async function addNationality(
  nationality: Omit<SelectNationalities, "id">,
) {
  await db.insert(nationalities).values(nationality);
  revalidatePath("/create/nationalities");
}

export async function updateNationality(nationality: SelectNationalities) {
  await db
    .update(nationalities)
    .set({ name: nationality.name })
    .where(eq(nationalities.id, nationality.id));
  revalidatePath("/create/nationalities");
}

export async function deleteNationality(nationality: { id: string }) {
  await db.delete(nationalities).where(eq(nationalities.id, nationality.id));
  revalidatePath("/create/nationalities");
}
