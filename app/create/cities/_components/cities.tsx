"use client";

import { SelectCountries } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import EditModal from "../../_components/edit-modal";
import DeleteModal from "../../_components/delete-modal";

export default function Cities({
  cities,
  countries,
}: {
  cities: SelectCitiesWithCountries[];
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] =
    useState<SelectCitiesWithCountries | null>(null);
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
        data={cities}
      />
      {initialValues && (
        <EditModal
          type="city"
          countriesList={countries}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      {initialValues && (
        <DeleteModal
          type="city"
          id={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
