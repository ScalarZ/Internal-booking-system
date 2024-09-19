"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bookings,
  SelectCompanies,
  SelectNationalities,
  SelectNileCruises,
  SelectBookingToursWithItineraries,
  SelectToursWithItineraries,
} from "@/drizzle/schema";
import From from "./form/form";
import OptionalTourModal from "../../search-screen/components/optional-tour-modal";
import FeedbackModal from "../../search-screen/components/feedback-modal";
import { useBooking } from "@/context/booking-context";
import FeedbackViewModal from "./feedback-view-modal";
import ForPage from "./for-page";
import { OptionalTourInfo } from "./optioanl-tour-info";

export default function BookingModal({
  companies,
  tours,
  nileCruises,
  nationalities,
  modalMode,
}: {
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nileCruises: SelectNileCruises[];
  nationalities: SelectNationalities[];
  initialValues?: Bookings;
  modalMode: "edit" | "add";
}) {
  const {
    booking,
    setBooking,
    isEditModalOpen,
    setIsEditModalOpen,
    isAddModalOpen,
    setIsAddModalOpen,
  } = useBooking();

  function handleChange(value: boolean) {
    if (modalMode === "edit") {
      setIsEditModalOpen(value);
      setBooking(undefined);
    } else {
      setIsAddModalOpen(value);
    }
  }

  return (
    <Dialog
      open={modalMode === "add" ? isAddModalOpen : isEditModalOpen}
      onOpenChange={handleChange}
    >
      {modalMode === "add" && (
        <ForPage page="/bookings" type="single">
          <Button onClick={() => setIsAddModalOpen(true)}>Add</Button>
        </ForPage>
      )}
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-4 overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between pt-1 capitalize">
          <DialogTitle>
            {modalMode === "add" ? "Add New" : "Edit"} Booking
          </DialogTitle>
          <ForPage type="single" page={"/search-screen"}>
            <div className="flex gap-x-2">
              <OptionalTourModal />
              <FeedbackModal type="survey" />
              <FeedbackModal type="review" />
            </div>
          </ForPage>
          {!!booking && (
            <ForPage type="multiple" page={["/bookings", "/search-screen"]}>
              <div className="flex gap-x-2">
                <FeedbackViewModal type="survey" feedbacks={booking.surveys} />
                <FeedbackViewModal type="review" feedbacks={booking.reviews} />
              </div>
            </ForPage>
          )}
        </DialogHeader>
        {!!booking?.optionalTour && (
          <OptionalTourInfo
            booking={{ ...booking, optionalTour: booking.optionalTour }}
          />
        )}
        <From
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
          modalMode={modalMode}
        />
      </DialogContent>
    </Dialog>
  );
}
