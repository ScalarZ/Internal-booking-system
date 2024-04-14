"use client";

import { SelectCountries } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import EditModal from "./edit-modal";
import DeleteModal from "./delete-modal";
import { columns } from "./columns";

export default function Countries({
  countries,
}: {
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] = useState<SelectCountries | null>(
    null,
  );
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
        data={countries}
      />
      {initialValues && (
        <EditModal
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
      {initialValues && (
        <DeleteModal
          countryId={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
