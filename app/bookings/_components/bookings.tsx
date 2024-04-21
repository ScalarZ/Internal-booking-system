"use client";

import { DataTable } from "@/app/create/_components/data-table";
import {
  SelectBookings,
  SelectCompanies,
  SelectCountries,
  SelectHotels,
  SelectNationalities,
  SelectNileCruises,
  SelectTours,
} from "@/drizzle/schema";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import EditBookingModal from "./edit-booking-modal";
import FilterBookings from "./filter-bookings";
import DeleteBookingModal from "./delete-booking-modal";
import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/utils/db-queries/booking";

export default function Bookings({
  companies,
  countries,
  tours,
  nationalities,
  nileCruises,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  tours: SelectTours[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
}) {
  const [initialValues, setInitialValues] = useState<SelectBookings | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });
  if (error || !data) return <p>Error fetching bookings</p>;
  return (
    <div>
      <FilterBookings countries={countries} />
      <DataTable
        columns={columns({
          setInitialValues,
          setIsEditModalOpen,
          setIsDeleteModalOpen,
        })}
        data={data}
        onRowClick={(row: SelectBookings) => {
          setInitialValues(row);
          setIsEditModalOpen(true);
          setIsDeleteModalOpen(false);
        }}
      />
      {!!initialValues && (
        <EditBookingModal
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      {!!initialValues && (
        <DeleteBookingModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          bookingId={initialValues.id}
          setInitialValues={setInitialValues}
        />
      )}
    </div>
  );
}
