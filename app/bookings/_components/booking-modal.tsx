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
  SelectBookingOptionalTours,
} from "@/drizzle/schema";
import From from "./form/form";
import OptionalTourModal from "../../search-screen/components/optional-tour-modal";
import FeedbackModal from "../../search-screen/components/feedback-modal";
import { useBooking } from "@/context/booking-context";
import { File } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateDoneStatus } from "@/utils/db-queries/tour";
import { usePathname } from "next/navigation";
import FeedbackViewModal from "./feedback-view-modal";

export default function BookingModal({
  companies,
  tours,
  nileCruises,
  nationalities,
  type,
  modalMode,
}: {
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nileCruises: SelectNileCruises[];
  nationalities: SelectNationalities[];
  type?: "booking" | "reservation" | "aviation";
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

  const pathname = usePathname();

  return (
    <Dialog
      open={modalMode === "add" ? isAddModalOpen : isEditModalOpen}
      onOpenChange={handleChange}
    >
      {pathname === "/bookings" && modalMode === "add" && (
        <div>
          <Button onClick={() => setIsAddModalOpen(true)}>Add</Button>
        </div>
      )}

      <DialogContent className="max-h-screen min-w-[1360px] gap-y-4 overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between pt-1 capitalize">
          <DialogTitle>
            {modalMode === "add" ? "Add New" : "Edit"} Booking
          </DialogTitle>
          {pathname === "/search-screen" && modalMode === "edit" && (
            <div className="flex gap-x-2">
              <OptionalTourModal />
              <FeedbackModal type="survey" />
              <FeedbackModal type="review" />
            </div>
          )}
          {booking && pathname === "/bookings" && modalMode === "edit" && (
            <div className="flex gap-x-2">
              <FeedbackViewModal type="survey" feedbacks={booking.surveys} />
              <FeedbackViewModal type="review" feedbacks={booking.reviews} />
            </div>
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
          type={type}
          modalMode={modalMode}
        />
      </DialogContent>
    </Dialog>
  );
}

function OptionalTourInfo({
  booking,
}: {
  booking: Bookings & { optionalTour: SelectBookingOptionalTours };
}) {
  async function handleOnCheckedChange(checked: boolean) {
    await updateDoneStatus({
      id: booking.optionalTour.id,
      done: checked,
    });
  }
  return (
    booking.optionalTour && (
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <Label>Done</Label>
          <Switch
            defaultChecked={booking.optionalTour.done}
            onCheckedChange={handleOnCheckedChange}
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <div>
            <span className="mr-2 text-sm font-medium">Representatives:</span>
            {booking.optionalTour.representatives?.map(({ name }, i, arr) => (
              <Badge key={i}>{name}</Badge>
            ))}
          </div>
          <p className="text-sm font-medium">
            PAX: <Badge>{booking.optionalTour.pax}</Badge>
          </p>
          <p className="text-sm font-medium">
            Currency: <Badge>{booking.optionalTour.currency}</Badge>
          </p>
          <p className="text-sm font-medium">
            Price: <Badge>{booking.optionalTour.price}</Badge>
          </p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-sm">
              <th className="border border-gray-200 px-4 py-2 text-left">
                Activity
              </th>
              <th className="border border-gray-200 px-4 py-2 text-left">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {booking.optionalTour.optionalActivities.map((item, index) => (
              <tr key={index} className="text-sm">
                <td className="border border-gray-200 px-4 py-2">
                  {item.name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {format(item.date ?? new Date(), "PPP")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <span className="text-sm font-medium">Files:</span>
          <ul className="flex flex-wrap gap-4">
            {booking.optionalTour.files?.map(({ url, name }) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <File size={28} strokeWidth={1.5} />
                  <p className="w-24   overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {name}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
}
