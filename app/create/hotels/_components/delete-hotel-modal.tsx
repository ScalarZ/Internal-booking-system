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
import { deleteHotel } from "@/utils/db-queries/hotel";

export default function DeleteHotelModal({
  isOpen,
  setIsOpen,
  hotelId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  hotelId: string;
  setInitialValues: (value: SelectHotelsWithCitiesAndCountries | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteHotel() {
    setIsLoading(true);
    try {
      await deleteHotel({ id: hotelId });
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
          <DialogTitle>Delete Hotel</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this hotel?</p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteHotel}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
