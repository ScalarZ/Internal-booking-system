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
import { SelectCountries } from "@/drizzle/schema";
import { deleteNileCruise } from "@/utils/db-queries/nile-cruise";

export default function DeleteModal({
  isOpen,
  setIsOpen,
  cruiseId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  cruiseId: string;
  setInitialValues: (value: SelectCountries | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteNileCruise() {
    setIsLoading(true);
    try {
      await deleteNileCruise({ id: cruiseId });
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
          <DialogTitle>Delete Nile Cruise</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this nile cruise?</p>
          <p className="text-sm text-neutral-500">
            Anything related to this nile cruise will be deleted
          </p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteNileCruise}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
