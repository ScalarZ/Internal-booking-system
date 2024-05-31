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
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { citySchema } from "@/utils/zod-schema";
import { addActivity } from "@/utils/db-queries/activity";
import { getCountryCities } from "@/utils/db-queries/city";
import { listCountryCities } from "@/utils/list-country-cities";

const supabase = createClient();

export default function CreateButton({
  countriesList,
}: {
  countriesList: SelectCountries[];
}) {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [open, setIsOpen] = useState(false);
  const [citiesList, setCitiesList] = useState<SelectCountries[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    nameError: "",
    countryError: "",
    cityError: "",
  });

  function resetErrorMessage() {
    setErrorMessage({ nameError: "", countryError: "", cityError: "" });
  }
  function resetModalInputs() {
    setName("");
    setCountryId("");
    setCityId("");
    setCitiesList([]);
    resetErrorMessage();
  }

  function checkForErrorMessage() {
    const inputs = {
      nameError: { value: name, message: "Please fill up this field" },
      countryError: { value: countryId, message: "Please select a country" },
      cityError: { value: cityId, message: "Please select a city" },
    };

    Object.entries(inputs).forEach((input) => {
      if (!input[1].value) {
        setErrorMessage((prev) => ({ ...prev, [input[0]]: input[1].message }));
      }
    });

    return Object.values(inputs).every((input) => input.value);
  }

  async function handleAddActivity(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      await addActivity({ name, countryId, cityId });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      resetModalInputs();
    }
  }

  useEffect(() => {
    if (!countryId) return;
    listCountryCities({ countryId, setCitiesList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

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
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <div>
          <Select
            type="country"
            list={countriesList}
            onClick={(countryId: string) => setCountryId(countryId)}
          />
          <p className="p-2 text-sm text-red-500">
            {errorMessage.countryError}
          </p>
        </div>
        <div>
          <Select
            type="city"
            countryId={countryId}
            list={citiesList}
            onClick={(cityId: string) => setCityId(cityId)}
          />
          <p className="p-2 text-sm text-red-500">{errorMessage.cityError}</p>
        </div>
        <form onSubmit={handleAddActivity}>
          <Label htmlFor="country">Name</Label>
          <Input
            className="mt-2"
            id="country"
            name="country"
            placeholder="Enter a country name"
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

function Select({
  type,
  list,
  countryId,
  onClick,
}: {
  type: "country" | "city";
  list: SelectCountries[];
  countryId?: string;
  onClick: (countryId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (type === "city") setValue("");
  }, [countryId, type]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={!list?.length}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value && list?.length
            ? list.find(({ name }) => name?.toLocaleLowerCase() === value)?.name
            : "Select a " + type}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup className="max-h-[240px] overflow-y-auto">
            {list?.map(({ id, name }) => (
              <CommandItem
                key={id}
                value={name!}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  onClick(id);
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
