"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader } from "lucide-react";
import { SelectBookings } from "@/drizzle/schema";
import { deleteBooking } from "@/utils/db-queries/booking";

export default function DeleteBookingModal({
  isOpen,
  setIsOpen,
  bookingId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  bookingId: string;
  setInitialValues: (value: SelectBookings | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteBooking() {
    setIsLoading(true);
    try {
      await deleteBooking(bookingId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setInitialValues(null);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        setInitialValues(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Booking</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this booking?</p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteBooking}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
