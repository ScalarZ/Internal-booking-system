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
import { updateCountry } from "@/utils/db-queries/country";
import { SelectCountries } from "@/drizzle/schema";

export default function EditModal({
  isOpen,
  setIsOpen,
  initialValues,
  setInitialValues,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  initialValues: SelectCountries;
  setInitialValues: (value: SelectCountries | null) => void;
}) {
  const [name, setName] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    nameError: "",
  });
  function resetErrorMessage() {
    setErrorMessage({ nameError: "" });
  }
  function resetModalInputs() {
    setName("");
    setInitialValues(null);
    resetErrorMessage();
  }

  function checkForErrorMessage() {
    const inputs = {
      nameError: { value: name, message: "Please fill up this field" },
    };

    Object.entries(inputs).forEach((input) => {
      if (!input[1].value) {
        setErrorMessage((prev) => ({ ...prev, [input[0]]: input[1].message }));
      }
    });

    return Object.values(inputs).every((input) => input.value);
  }

  async function handleUpdateCountry(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      await updateCountry({ id: initialValues.id, name });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      resetModalInputs();
    }
  }

  useEffect(() => {
    setName(initialValues.name);
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
          <DialogTitle>Update Country</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateCountry}>
          <Label htmlFor="country">Name</Label>
          <Input
            className="mt-2"
            id="country"
            name="country"
            placeholder="Enter a city name"
            value={name ?? ""}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="p-2 text-sm text-red-500">{errorMessage.nameError}</p>
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
