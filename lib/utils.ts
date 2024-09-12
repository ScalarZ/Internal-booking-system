import { SelectCities } from "@/drizzle/schema";
import { Itinerary } from "@/types_";
import { type ClassValue, clsx } from "clsx";
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
