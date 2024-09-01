"use client";

import { useState } from "react";
import TourModal from "./tour-modal";
import { SelectCountries } from "@/drizzle/schema";

export default function CreateTour({
  countriesList,
}: {
  countriesList: SelectCountries[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TourModal
        modalMode="add"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        countriesList={countriesList}
      />
    </>
  );
}
