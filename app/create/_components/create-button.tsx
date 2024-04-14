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
import { Loader, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectCountries } from "@/drizzle/schema";
import { addRepresentative } from "@/utils/db-queries/representatives";
import { addCity } from "@/utils/db-queries/city";
import { addGuide } from "@/utils/db-queries/guide";
import { errorDefaultValue } from "./default-values";

export default function CreateButton({
  countriesList,
  type,
}: {
  countriesList: SelectCountries[];
  type: "city" | "guide" | "representative";
}) {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [open, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorDefaultValue);

  function resetErrorMessage() {
    setErrorMessage(errorDefaultValue);
  }
  function resetModalInputs() {
    setName("");
    setCountryId("");
    resetErrorMessage();
  }

  function checkForErrorMessage() {
    const inputs = {
      nameError: { value: name, message: `Please fill enter a ${type} name` },
      countryError: { value: countryId, message: "Please select a country" },
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
      switch (type) {
        case "city":
          await addCity({ name, countryId });
          break;
        case "guide":
          await addGuide({ name, countryId });
          break;
        case "representative":
          await addRepresentative({ name, countryId });
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      resetModalInputs();
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
        <DialogHeader className="capitalize">
          <DialogTitle>Add New {type}</DialogTitle>
        </DialogHeader>
        <div>
          <SelectCountry
            countriesList={countriesList}
            setCountryId={(countryId: string) => setCountryId(countryId)}
          />
          <p className="p-2 text-sm text-red-500">
            {errorMessage.countryError}
          </p>
        </div>
        <form onSubmit={handleAddCountry}>
          <Label htmlFor="name">Name</Label>
          <Input
            className="mt-2"
            id="name"
            name="name"
            placeholder={`Enter a ${type} name`}
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

function SelectCountry({
  countriesList,
  setCountryId,
}: {
  countriesList: SelectCountries[];
  setCountryId: (countryId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? countriesList.find(
                ({ name }) => name?.toLocaleLowerCase() === value,
              )?.name
            : "Select a country"}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup className="max-h-[240px] overflow-y-auto">
            {countriesList.map(({ id, name }) => (
              <CommandItem
                key={id}
                value={name!}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  setCountryId(id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === id ? "opacity-100" : "opacity-0",
                  )}
                />
                {name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
