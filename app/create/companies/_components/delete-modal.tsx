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
import { SelectCompanies } from "@/drizzle/schema";
import { deleteCompany } from "@/utils/db-queries/company";

export default function DeleteModal({
  isOpen,
  setIsOpen,
  companyId,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  companyId: string;
  setInitialValues: (value: SelectCompanies | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeleteCompany() {
    setIsLoading(true);
    try {
      await deleteCompany({ id: companyId });
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
          <DialogTitle>Delete Company</DialogTitle>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this company?</p>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDeleteCompany}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
