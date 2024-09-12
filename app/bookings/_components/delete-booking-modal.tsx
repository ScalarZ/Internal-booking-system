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
import { deleteBooking } from "@/utils/db-queries/booking";
import { useBooking } from "@/context/booking-context";

export default function DeleteBookingModal({
  bookingId,
}: {
  bookingId: number;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const { isDeleteModalOpen, setIsDeleteModalOpen } = useBooking();
  async function handleDeleteBooking() {
    setIsLoading(true);
    try {
      await deleteBooking(bookingId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
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
