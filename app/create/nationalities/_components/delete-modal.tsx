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
import { SelectNationalities } from "@/drizzle/schema";
import { deleteNationality } from "@/utils/db-queries/nationality";

export default function DeleteModal({
  isOpen,
  setIsOpen,
  nationalityId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  nationalityId: string;
  setInitialValues: (value: SelectNationalities | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteNationality() {
    setIsLoading(true);
    try {
      await deleteNationality({ id: nationalityId });
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
          <DialogTitle>Delete Nationality</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this nationality?</p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteNationality}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
