"use client";

import { SelectCountries } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import EditModal from "../../_components/edit-modal";
import { useDeleteModal } from "@/context/delete-modal-context";
import DeleteModal from "@/app/_components/delete-modal";
import { deleteCity } from "@/utils/db-queries/city";

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
  const { setIsDeleteModalOpen } = useDeleteModal();
  async function handleDeleteCity() {
    try {
      await deleteCity({ id: initialValues?.id });
    } catch (err) {
      console.error(err);
    } finally {
      setInitialValues(null);
    }
  }

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
      <DeleteModal title="Delete City" onDelete={handleDeleteCity}>
        <div>
          <p>Are you sure you want to delete this city?</p>
          <p className="text-sm text-neutral-500">
            Anything related to this city will be deleted
          </p>
        </div>
      </DeleteModal>
    </div>
  );
}
