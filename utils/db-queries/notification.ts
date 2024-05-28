"use server";

import { db } from "@/drizzle/db";
import { SelectCities, cities, notifications } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotifications(type: "booking" | "reservation") {
  return db.select().from(notifications).where(eq(notifications.type, type));
}
