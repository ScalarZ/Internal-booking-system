import {
  SelectBookingItineraries,
  SelectItineraries,
  SelectReservations,
} from "./drizzle/schema";

export type Itinerary = (
  | Omit<SelectItineraries, "createdAt" | "updatedAt">
  | Omit<SelectBookingItineraries, "createdAt" | "updatedAt">
) & {
  id: string | number;
};

export type Reservation = Omit<
  SelectReservations,
  "id" | "createdAt" | "updatedAt"
>;
