"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { Loader } from "lucide-react";
import { addCountry } from "@/utils/db-queries/country";

export default function CreateCountryButton() {
  const [name, setName] = useState("");
  const [open, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    nameError: "",
  });

  function resetErrorMessage() {
    setErrorMessage({ nameError: "" });
  }
  function resetModalInputs() {
    setName("");
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

  async function handleAddCountry(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      await addCountry({ name });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setIsOpen(value);
        resetModalInputs();
      }}
    >
      <DialogTrigger className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-sky-900 px-4 py-2 text-sm font-medium text-sky-50 ring-offset-white transition-colors hover:bg-sky-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-sky-50 dark:text-sky-900 dark:ring-offset-sky-950 dark:hover:bg-sky-50/90 dark:focus-visible:ring-sky-300">
        Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Country</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddCountry}>
          <Label htmlFor="country">Name</Label>
          <Input
            className="mt-2"
            id="country"
            name="country"
            placeholder="Enter a city name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="p-2 text-sm text-red-500">{errorMessage.nameError}</p>
          <DialogFooter className="pt-4">
            <Button type="button" variant={"outline"}>
              Cancel
            </Button>
            <Button type="submit" className="flex gap-x-1">
              {isLoading && <Loader size={14} className="animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
