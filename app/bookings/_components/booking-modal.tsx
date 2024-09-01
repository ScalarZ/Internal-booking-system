"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SelectBookingWithReservations,
  SelectCompanies,
  SelectNationalities,
  SelectNileCruises,
  SelectBookingToursWithItineraries,
  SelectToursWithItineraries,
} from "@/drizzle/schema";
import From from "./form/form";

export default function BookingModal({
  companies,
  tours,
  nileCruises,
  nationalities,
  initialValues,
  isOpen,
  type,
  setIsOpen,
  setInitialValues,
  modalMode,
}: {
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nileCruises: SelectNileCruises[];
  nationalities: SelectNationalities[];
  isOpen: boolean;
  type?: "booking" | "reservation" | "aviation";
  initialValues?: SelectBookingWithReservations;
  setIsOpen: (value: boolean) => void;
  setInitialValues?: (value: SelectBookingWithReservations | null) => void;
  modalMode: "edit" | "add";
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {modalMode === "add" && (
        <div className="mb-4 flex w-full justify-end">
          <Button onClick={() => setIsOpen(true)}>Add</Button>
        </div>
      )}
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-4 overflow-y-auto">
        <DialogHeader className="capitalize">
          <DialogTitle>
            {modalMode === "add" ? "Add New" : "Edit"} Booking
          </DialogTitle>
        </DialogHeader>
        <From
          initialValues={initialValues}
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
          closeModal={() => setIsOpen(false)}
          setInitialValues={setInitialValues}
          type={type}
          modalMode={modalMode}
        />
      </DialogContent>
    </Dialog>
  );
}
