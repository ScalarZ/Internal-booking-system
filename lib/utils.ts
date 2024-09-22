import { SelectCities, SelectReservations } from "@/drizzle/schema";
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

export function getReservationRowStatus(reservations?: SelectReservations[]) {
  if (reservations?.every((reservation) => reservation.finalPrice))
    return "success";
  if (reservations?.some((reservation) => reservation.finalPrice))
    return "warning";
  return "danger";
}

export function getAviationRowStatus(
  domesticFlights?: Omit<ArrivalDeparturePair<DomesticFlight>[], "file"> | null,
) {
  if (domesticFlights?.some(({ arrival, departure }) => !arrival || !departure))
    return "danger";
  if (
    domesticFlights?.every(
      ({ arrival, departure }) =>
        Object.values(arrival).every((value) => !!value) &&
        Object.values(departure).every((value) => !!value),
    )
  )
    return "success";
  if (
    domesticFlights?.every(
      ({
        arrival: { issued: arrivalIssued, ...arrivalProps },
        departure: { issued: departureIssued, ...departureProps },
      }) =>
        Object.values(arrivalProps).some(
          (value) => !!value && !arrivalIssued,
        ) ||
        (Object.values(departureProps).some((value) => !!value) &&
          !!departureIssued),
    )
  )
    return "warning";
  return "danger";
}
