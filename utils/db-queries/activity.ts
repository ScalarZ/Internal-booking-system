"use server";

import { db } from "@/drizzle/db";
import { SelectActivities, activities } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getActivities() {
  return await db.query.activities.findMany({
    with: { country: true, city: true },
  });
}

export async function addActivity(activity: Omit<SelectActivities, "id">) {
  "use server";
  await db.insert(activities).values(activity);
  revalidatePath("/create/activities");
}

export async function updateActivity(activity: SelectActivities) {
  await db
    .update(activities)
    .set({
      name: activity.name,
      countryId: activity.countryId,
      cityId: activity.cityId,
    })
    .where(eq(activities.id, activity.id));
  revalidatePath("/create/activities");
}

export async function deleteActivity(activity: { id: string }) {
  await db.delete(activities).where(eq(activities.id, activity.id));
  revalidatePath("/create/activities");
}

export async function getCityActivities({
  countryId,
  cityId,
}: {
  countryId: string;
  cityId: string;
}) {
  try {
    return {
      data: await db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.countryId, countryId),
            eq(activities.cityId, cityId),
          ),
        ),
    };
  } catch (error) {
    return { error };
  }
}
