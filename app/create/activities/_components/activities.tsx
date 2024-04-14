"use client";

import {
  SelectActivities,
  SelectCities,
  SelectCountries,
} from "@/drizzle/schema";
import React, { useState } from "react";
import { DataTable } from "../../_components/data-table";
import { columns } from "./columns";
import EditActivityModal from "./edit-activity-modal";
import DeleteActivityModal from "./delete-activity-modal";

export default function Activities({
  activities,
  countries,
}: {
  activities: SelectActivitiesWithCitiesAndCountries[];
  countries: SelectCountries[];
}) {
  const [initialValues, setInitialValues] =
    useState<SelectActivitiesWithCitiesAndCountries | null>(null);
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
        data={activities}
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
        <DeleteActivityModal
          activityId={initialValues.id}
          setInitialValues={setInitialValues}
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
