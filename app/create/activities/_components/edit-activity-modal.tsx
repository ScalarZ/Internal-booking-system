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
import { updateActivity } from "@/utils/db-queries/activity";
import { Switch } from "@/components/ui/switch";

const supabase = createClient();

export default function EditActivityModal({
  isOpen,
  setIsOpen,
  initialValues,
  setInitialValues,
  countriesList,
}: {
  countriesList: SelectCountries[];
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  initialValues: SelectActivitiesWithCitiesAndCountries;
  setInitialValues: (
    value: SelectActivitiesWithCitiesAndCountries | null,
  ) => void;
}) {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [citiesList, setCitiesList] = useState<SelectCountries[]>([]);
  const [isOptional, setIsOptional] = useState(false);
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
    setInitialValues(null);
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

  async function handleUpdateActivity(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      await updateActivity({
        name,
        countryId,
        cityId,
        id: initialValues.id,
        isOptional,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      resetModalInputs();
    }
  }

  async function getCountryCities() {
    setCitiesList([]);
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, countryId:country_id")
        .eq("country_id", countryId);

      if (error) throw error;

      const cities = z.array(citySchema).parse(data);
      setCitiesList(cities);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!countryId) return;
    getCountryCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  useEffect(() => {
    setName(initialValues.name ?? "");
    setCountryId(initialValues.countryId ?? "");
    setCityId(initialValues.cityId ?? "");
    setIsOptional(initialValues.isOptional ?? "");
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
          <DialogTitle>Update Activity</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-x-2 py-2">
          <Label>Optional</Label>
          <Switch checked={isOptional} onCheckedChange={setIsOptional} />
        </div>
        <div>
          <Select
            type="country"
            initialValues={initialValues}
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
            initialValues={initialValues}
            list={citiesList}
            onClick={(cityId: string) => setCityId(cityId)}
          />
          <p className="p-2 text-sm text-red-500">{errorMessage.cityError}</p>
        </div>
        <form onSubmit={handleUpdateActivity}>
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
              Update
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
  initialValues,
  countryId,
  onClick,
}: {
  type: "country" | "city";
  list: SelectCountries[];
  initialValues: SelectActivitiesWithCitiesAndCountries;
  countryId?: string;
  onClick: (countryId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (type === "city")
      setValue(initialValues.city?.name?.toLocaleLowerCase() ?? "");
    else setValue(initialValues.country?.name?.toLocaleLowerCase() ?? "");
  }, [initialValues, type]);

  useEffect(() => {
    if (type === "city" && countryId != initialValues.countryId) setValue("");
  }, [countryId, initialValues, type]);

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
