"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { SelectCompanies } from "@/drizzle/schema";
import { updateCompany } from "@/utils/db-queries/company";

const errorDefaultValue = {
  nameError: "",
  companyId: "",
};

export default function EditModal({
  isOpen,
  setIsOpen,
  initialValues,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  initialValues: SelectCompanies;
  setInitialValues: (value: SelectCompanies | null) => void;
}) {
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorDefaultValue);
  function resetErrorMessage() {
    setErrorMessage(errorDefaultValue);
  }
  function resetModalInputs() {
    setName("");
    setCompanyId("");
    setInitialValues(null);
    resetErrorMessage();
  }

  function checkForErrorMessage() {
    const inputs = {
      nameError: { value: name, message: "Please enter a company name" },
      companyError: { value: companyId, message: "Please enter a company ID" },
    };

    Object.entries(inputs).forEach((input) => {
      if (!input[1].value) {
        setErrorMessage((prev) => ({ ...prev, [input[0]]: input[1].message }));
      }
    });

    return Object.values(inputs).every((input) => input.value);
  }

  async function handleUpdateCompany(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      await updateCompany({ id: initialValues.id, name, companyId });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      resetModalInputs();
    }
  }

  useEffect(() => {
    setName(initialValues.name ?? "");
    setCompanyId(initialValues.companyId ?? "");
  }, [initialValues]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        resetModalInputs();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateCompany}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              className="mt-2"
              id="name"
              name="name"
              placeholder="Enter a company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="p-2 text-sm text-red-500">{errorMessage.nameError}</p>
          </div>
          <div>
            <Label htmlFor="companyId">Company ID</Label>
            <Input
              className="mt-2"
              id="companyId"
              name="companyId"
              placeholder="Enter a company ID"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
            <p className="p-2 text-sm text-red-500">{errorMessage.companyId}</p>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant={"outline"}>
              Cancel
            </Button>
            <Button type="submit" className="flex gap-x-1">
              {isLoading && <Loader size={14} className="animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
