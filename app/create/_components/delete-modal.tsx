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
import { deleteCity } from "@/utils/db-queries/city";
import { deleteGuide } from "@/utils/db-queries/guide";
import { deleteRepresentative } from "@/utils/db-queries/representatives";
import { defaultValue } from "./default-values";

export default function DeleteModal({
  isOpen,
  setIsOpen,
  id,
  setInitialValues,
  type,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  id: string;
  setInitialValues: (
    value: SelectCitiesWithCountries | SelectGuidesWithCountries,
  ) => void;
  type: "city" | "guide" | "representative";
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteCity() {
    setIsLoading(true);
    try {
      switch (type) {
        case "city":
          await deleteCity({ id });
          break;
        case "guide":
          await deleteGuide({ id });
          break;
        case "representative":
          await deleteRepresentative({ id });
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setInitialValues(defaultValue);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        setInitialValues(defaultValue);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Delete {type}</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this {type}?</p>
          <p className="text-sm text-neutral-500">
            Anything related to this {type} will be deleted
          </p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteCity}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
