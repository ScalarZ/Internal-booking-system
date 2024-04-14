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
import { deleteActivity } from "@/utils/db-queries/activity";

export default function DeleteActivityModal({
  isOpen,
  setIsOpen,
  activityId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  activityId: string;
  setInitialValues: (value: SelectActivitiesWithCitiesAndCountries | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteActivity() {
    setIsLoading(true);
    try {
      await deleteActivity({ id: activityId });
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
          <DialogTitle>Delete Activity</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this activity?</p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteActivity}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
