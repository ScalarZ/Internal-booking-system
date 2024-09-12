"use client";

import { DataTable } from "@/app/create/_components/data-table";
import {
  SelectCompanies,
  SelectCountries,
  SelectNationalities,
  SelectNileCruises,
  SelectToursWithItineraries,
  SelectBookingToursWithItineraries,
  Bookings,
} from "@/drizzle/schema";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookingProvider, useBooking } from "@/context/booking-context";
import FilterBookings from "@/app/bookings/_components/filter-bookings";
import BookingModal from "@/app/bookings/_components/booking-modal";
import { getToursWithBooking } from "@/utils/db-queries/tour";
import { Columns, columns } from "./columns";

export default function ToursBooking({
  companies,
  countries,
  tours,
  nationalities,
  nileCruises,
  type,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  type?: "booking" | "reservation" | "aviation";
}) {
  return (
    <BookingProvider>
      <Content
        companies={companies}
        countries={countries}
        tours={tours}
        nationalities={nationalities}
        nileCruises={nileCruises}
        type={type}
      />
    </BookingProvider>
  );
}

function Content({
  companies,
  countries,
  tours,
  nationalities,
  nileCruises,
  type,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  type?: "booking" | "reservation" | "aviation";
}) {
  const { booking, setBooking, isEditModalOpen, setIsEditModalOpen } =
    useBooking();
  const { data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: getToursWithBooking,
  });

  if (error || !data) return <p>Error fetching bookings</p>;

  return (
    <div className="space-y-4">
      <FilterBookings countries={countries} />
      <DataTable
        //@ts-ignore
        columns={columns()}
        data={
          data.map(({ booking, ...props }) => ({
            ...booking,
            optionalTour: props,
          })) as Columns[]
        }
        onRowClick={(row: Bookings) => {
          setBooking(row);
          setIsEditModalOpen(true);
        }}
        type={type}
      />
      {booking && isEditModalOpen && (
        <BookingModal
          modalMode="edit"
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
          type={type}
        />
      )}
    </div>
  );
}
