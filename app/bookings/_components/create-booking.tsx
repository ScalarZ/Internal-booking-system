"use client";

import {
  SelectCompanies,
  SelectNationalities,
  SelectNileCruises,
  SelectToursWithItineraries,
} from "@/drizzle/schema";
import BookingModal from "./booking-modal";
import { useState } from "react";

export default function CreateBooking({
  nileCruises,
  companies,
  tours,
  nationalities,
}: {
  nileCruises: SelectNileCruises[];
  companies: SelectCompanies[];
  nationalities: SelectNationalities[];
  tours: SelectToursWithItineraries[];
}) {
  return (
    <BookingModal
      modalMode="add"
      nileCruises={nileCruises}
      companies={companies}
      nationalities={nationalities}
      tours={tours}
    />
  );
}
