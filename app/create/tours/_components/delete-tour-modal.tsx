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
import { SelectTours } from "@/drizzle/schema";
import { deleteTour } from "@/utils/db-queries/tour";

export default function DeleteTourModal({
  isOpen,
  setIsOpen,
  tourId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  tourId: string;
  setInitialValues: (value: SelectTours | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteTour() {
    setIsLoading(true);
    try {
      await deleteTour({ id: tourId });
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
          <DialogTitle>Delete Tour</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this tour?</p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteTour}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
