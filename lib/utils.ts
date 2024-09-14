import { SelectCities } from "@/drizzle/schema";
import { Itinerary } from "@/types_";
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
