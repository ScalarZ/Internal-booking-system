"use client";

import { SelectCountries } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import EditModal from "../../_components/edit-modal";
import { columns } from "./columns";
import DeleteModal from "../../_components/delete-modal";

export default function Guides({
  guides,
  countries,
}: {
  guides: SelectGuidesWithCountries[];
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] =
    useState<SelectGuidesWithCountries | null>(null);
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
        data={guides}
      />
      {initialValues && (
        <EditModal
          type="guide"
          countriesList={countries}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      {initialValues && (
        <DeleteModal
          type="guide"
          id={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
