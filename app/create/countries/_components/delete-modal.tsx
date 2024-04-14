"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormEvent, useState } from "react";
import { Loader } from "lucide-react";
import { deleteCountry, updateCountry } from "@/utils/db-queries/country";
import { SelectCountries } from "@/drizzle/schema";

export default function DeleteModal({
  isOpen,
  setIsOpen,
  countryId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  countryId: string;
  setInitialValues: (value: SelectCountries | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteCountry() {
    setIsLoading(true);
    try {
      await deleteCountry({ id: countryId });
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
          <DialogTitle>Delete Country</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this country?</p>
          <p className="text-sm text-neutral-500">
            Anything related to this country will be deleted
          </p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteCountry}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
