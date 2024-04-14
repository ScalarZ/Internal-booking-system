"use client";

import { SelectCountries } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import EditActivityModal from "./edit-activity-modal";
import DeleteHotelModal from "./delete-hotel-modal";

export default function Hotels({
  hotels,
  countries,
}: {
  hotels: SelectHotelsWithCitiesAndCountries[];
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] =
    useState<SelectHotelsWithCitiesAndCountries | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="py-8">
      <DataTable
        columns={columns({
          setInitialValues,
          setIsEditModalOpen,
          setIsDeleteModalOpen,
        })}
        data={hotels}
      />
      {initialValues && (
        <EditActivityModal
          countriesList={countries}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      {initialValues && (
        <DeleteHotelModal
          hotelId={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
