"use server";

import { db } from "@/drizzle/db";
import { SelectNileCruises, nileCruises } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNileCruises() {
  return db.select().from(nileCruises);
}

export async function addNileCruise(nileCruise: Omit<SelectNileCruises, "id">) {
  await db.insert(nileCruises).values(nileCruise);
  revalidatePath("/create/nile-cruise");
}

export async function updateNileCruise(nileCruise: SelectNileCruises) {
  await db
    .update(nileCruises)
    .set({ name: nileCruise.name })
    .where(eq(nileCruises.id, nileCruise.id));
  revalidatePath("/create/nile-cruise");
}

export async function deleteNileCruise(nileCruise: { id: string }) {
  await db.delete(nileCruises).where(eq(nileCruises.id, nileCruise.id));
  revalidatePath("/create/nile-cruise");
}
