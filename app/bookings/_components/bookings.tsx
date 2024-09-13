"use client";

import { DataTable } from "@/app/create/_components/data-table";
import {
  Bookings as BookingsType,
  SelectCompanies,
  SelectCountries,
  SelectNationalities,
  SelectNileCruises,
  SelectToursWithItineraries,
  SelectBookingToursWithItineraries,
} from "@/drizzle/schema";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import FilterBookings from "./filter-bookings";
import DeleteBookingModal from "./delete-booking-modal";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/utils/db-queries/booking";
import BookingModal from "./booking-modal";
import { BookingProvider, useBooking } from "@/context/booking-context";
import CreateBooking from "./create-booking";

export default function Bookings({
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
  const {
    booking,
    setBooking,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
  } = useBooking();

  const { data, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });
  if (error || !data) return <p>Error fetching bookings</p>;
  return (
    <div className="space-y-4">
      <div className="flex gap-x-8">
        <FilterBookings countries={countries} />
        <CreateBooking
          nileCruises={nileCruises}
          companies={companies}
          nationalities={nationalities}
          tours={tours}
        />
      </div>
      <DataTable
        // @ts-ignore
        columns={columns({
          type,
          setBooking,
          setIsEditModalOpen,
          setIsDeleteModalOpen,
        })}
        data={data}
        onRowClick={(row: BookingsType) => {
          setBooking(row);
          setIsDeleteModalOpen(false);
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
      {booking && isDeleteModalOpen && (
        <DeleteBookingModal bookingId={booking.id} />
      )}
    </div>
  );
}
