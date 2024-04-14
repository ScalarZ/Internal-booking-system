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
import { FormEvent, useEffect, useState } from "react";
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
import { updateCity } from "@/utils/db-queries/city";
import { updateGuide } from "@/utils/db-queries/guide";
import { updateRepresentative } from "@/utils/db-queries/representatives";
import { errorDefaultValue } from "./default-values";

export default function EditModal({
  isOpen,
  initialValues,
  countriesList,
  type,
  setIsOpen,
  setInitialValues,
}: {
  countriesList: SelectCountries[];
  type: "city" | "guide" | "representative";
  isOpen: boolean;
  initialValues: SelectGuidesWithCountries | SelectGuidesWithCountries;
  setIsOpen: (value: boolean) => void;
  setInitialValues: (
    value: SelectGuidesWithCountries | SelectGuidesWithCountries | null,
  ) => void;
}) {
  const [name, setName] = useState<string | null>(initialValues.name);
  const [countryId, setCountryId] = useState(initialValues.country?.id ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorDefaultValue);

  function resetErrorMessage() {
    setErrorMessage({ nameError: "", countryError: "" });
  }
  function resetModalInputs() {
    setName("");
    setCountryId("");
    resetErrorMessage();
    setInitialValues(null);
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

  async function handleUpdateCountry(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      switch (type) {
        case "city":
          await updateCity({ name, countryId, id: initialValues.id });
          break;
        case "guide":
          await updateGuide({ name, countryId, id: initialValues.id });
          break;
        case "representative":
          await updateRepresentative({ name, countryId, id: initialValues.id });
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
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        resetModalInputs();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Update {type}</DialogTitle>
        </DialogHeader>
        <div>
          <SelectCountry
            initialValues={initialValues}
            countriesList={countriesList}
            setCountryId={(countryId: string) => setCountryId(countryId)}
          />
          <p className="p-2 text-sm text-red-500">
            {errorMessage.countryError}
          </p>
        </div>
        <form onSubmit={handleUpdateCountry}>
          <Label htmlFor="country">Name</Label>
          <Input
            className="mt-2"
            id="name"
            name="name"
            placeholder={`Enter a ${type} name`}
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

function SelectCountry({
  countriesList,
  setCountryId,
  initialValues,
}: {
  countriesList: SelectCountries[];
  setCountryId: (countryId: string) => void;
  initialValues: SelectGuidesWithCountries;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValues.country?.name?.toLocaleLowerCase() ?? "");
  }, [initialValues]);
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
