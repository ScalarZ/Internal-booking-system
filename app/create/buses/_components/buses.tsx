"use client";

import { SelectCountries } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import EditModal from "../../_components/edit-modal";
import { useDeleteModal } from "@/context/delete-modal-context";
import DeleteModal from "@/app/_components/delete-modal";
import { deleteBus } from "@/utils/db-queries/buses";

export default function Buses({
  buses,
  countries,
}: {
  buses: SelectCitiesWithCountries[];
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] =
    useState<SelectCitiesWithCountries | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { setIsDeleteModalOpen } = useDeleteModal();

  async function handleDeleteBus() {
    try {
      await deleteBus({ id: initialValues?.id });
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
        data={buses}
      />
      {initialValues && (
        <EditModal
          type="bus"
          countriesList={countries}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      <DeleteModal title="Delete Bus" onDelete={handleDeleteBus}>
        <div>
          <p>Are you sure you want to delete this bus?</p>
          <p className="text-sm text-neutral-500">
            Anything related to this bus will be deleted
          </p>
        </div>
      </DeleteModal>
    </div>
  );
}
