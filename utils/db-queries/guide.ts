"use server";

import { db } from "@/drizzle/db";
import { SelectCities, SelectGuides, guides } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGuides() {
  return db.query.guides.findMany({ with: { country: true } });
}

export async function addGuide(guide: Omit<SelectGuides, "id">) {
  await db.insert(guides).values(guide);
  revalidatePath("/create/guides");
}

export async function updateGuide(guide: SelectCities) {
  await db
    .update(guides)
    .set({ name: guide.name, countryId: guide.countryId })
    .where(eq(guides.id, guide.id));
  revalidatePath("/create/guides");
}

export async function deleteGuide(guide: { id: string }) {
  await db.delete(guides).where(eq(guides.id, guide.id));
  revalidatePath("/create/guides");
}

export async function getCountryGuides(guideId: string) {
  try {
    return {
      data: await db.select().from(guides).where(eq(guides.countryId, guideId)),
    };
  } catch (error) {
    return { error };
  }
}
