"use client";

import { SelectNationalities } from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import EditModal from "./edit-modal";
import DeleteModal from "./delete-modal";
import { columns } from "./columns";

export default function Nationalities({
  nationalities,
}: {
  nationalities: SelectNationalities[];
}) {
  const [initialValues, setInitialValues] =
    useState<SelectNationalities | null>(null);
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
        data={nationalities}
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
          nationalityId={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
