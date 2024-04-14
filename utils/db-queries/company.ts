"use server";

import { db } from "@/drizzle/db";
import { SelectCompanies, companies } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCompanies() {
  return db.select().from(companies);
}

export async function addCompany(company: Omit<SelectCompanies, "id">) {
  await db.insert(companies).values(company);
  revalidatePath("/create/companies");
}

export async function updateCompany(company: SelectCompanies) {
  await db
    .update(companies)
    .set({ name: company.name, companyId: company.companyId })
    .where(eq(companies.id, company.id));
  revalidatePath("/create/companies");
}

export async function deleteCompany(company: { id: string }) {
  await db.delete(companies).where(eq(companies.id, company.id));
  revalidatePath("/create/companies");
}
