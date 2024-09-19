import { SelectCities } from "@/drizzle/schema";
import { Itinerary } from "@/types_";
import { getCompanies } from "@/utils/db-queries/company";
import { getCountries } from "@/utils/db-queries/country";
import { getNationalities } from "@/utils/db-queries/nationality";
import { getNileCruises } from "@/utils/db-queries/nile-cruise";
import { getTours } from "@/utils/db-queries/tour";
import { type ClassValue, clsx } from "clsx";
import { format, parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function listItineraryCities(itineraries: Itinerary[]) {
  return (
    itineraries?.reduce<SelectCities[]>(
      (acc, curr) => [...acc, ...(curr.cities ?? [])],
      [],
    ) ?? []
  );
}

export function formatDateString(date: string) {
  return format(parse(date, "HH:mm", new Date()), "HH:mm");
}

export function getFilter(searchParams: { [key: string]: string | undefined }) {
  const dateRange = searchParams["dateRange"];
  const country = searchParams["country"];
  const id = searchParams["id"];

  if (!dateRange && !country && !id) return undefined;

  const from =
    dateRange?.split("|").map((date) => new Date(date))[0] ?? undefined;
  const to =
    dateRange?.split("|").map((date) => new Date(date))[1] ?? undefined;

  return {
    dateRange: {
      from: from instanceof Date ? from : undefined,
      to: to instanceof Date ? to : undefined,
    },
    country,
    id,
  };
}

export async function getBookingParams() {
  return await Promise.all([
    getCountries(),
    getCompanies(),
    getTours(),
    getNationalities(),
    getNileCruises(),
  ]);
}
