"use client";

import { SelectCountries, SelectTours } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import DeleteTourModal from "./delete-tour-modal";
import EditTourModal from "./edit-tour-modal";

export default function Tours({
  tours,
  countries,
}: {
  tours: SelectTours[];
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] = useState<SelectTours | null>(null);
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
        data={tours}
      />
      {initialValues && (
        <EditTourModal
          countriesList={countries}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      {initialValues && (
        <DeleteTourModal
          tourId={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
