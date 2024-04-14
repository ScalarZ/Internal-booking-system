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

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronsUpDown, X, XCircle, Edit } from "lucide-react";
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
import {
  SelectActivities,
  SelectCities,
  SelectCountries,
} from "@/drizzle/schema";
import { createClient } from "@/utils/supabase/client";
import { activitySchema, citySchema } from "@/utils/zod-schema";
import { z } from "zod";

const supabase = createClient();

export default function EditItineraryModal({
  isOpen,
  cities,
  activities,
  initialValues,
  setIsOpen,
  setItineraries,
  setInitialValues,
}: {
  isOpen: boolean;
  initialValues: Itinerary;
  cities: SelectCities[];
  activities: SelectActivities[];
  setIsOpen: (value: boolean) => void;
  setInitialValues: (initialValues: Itinerary | null) => void;
  setItineraries: (cb: (itinerary: Itinerary[]) => Itinerary[]) => void;
}) {
  const [selectedCities, setSelectedCities] = useState<SelectCities[]>(
    initialValues.cities,
  );
  const [selectedActivities, setSelectedActivities] = useState<
    SelectActivities[]
  >(initialValues.activities);

  const [citiesList, setCitiesList] = useState<SelectCities[]>(cities);
  const [activitiesList, setActivitiesList] =
    useState<SelectActivities[]>(activities);
  const [errorMessage, setErrorMessage] = useState({
    nameError: "",
    countryError: "",
    cityError: "",
  });

  function resetModalInputs() {
    resetItineraryInputs();
    setErrorMessage({ nameError: "", countryError: "", cityError: "" });
  }

  function resetItineraryInputs() {
    setSelectedCities([]);
    setCitiesList([]);
    setSelectedActivities([]);
    setActivitiesList([]);
    setInitialValues(null);
  }

  function editItinerary() {
    setItineraries((prev) =>
      prev.map((itinerary) => {
        if (itinerary.day === initialValues?.day) {
          itinerary.cities = selectedCities;
          itinerary.activities = selectedActivities;
        }
        return itinerary;
      }),
    );
    setIsOpen(false);
    resetItineraryInputs();
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        resetModalInputs();
      }}
    >
      <DialogContent className="gap-y-2">
        <DialogHeader>
          <DialogTitle>Edit Itinerary</DialogTitle>
        </DialogHeader>
        <span className="font-medium">{initialValues?.day}</span>
        {/* Cities */}
        <div>
          <Select<SelectCities>
            list={citiesList}
            onClick={(city: SelectCities) =>
              !selectedCities.some(({ id }) => id === city.id)
                ? setSelectedCities((prev) => [...prev, city])
                : null
            }
            type="city"
          />
          <ul className="flex gap-x-2 p-2 text-white">
            {selectedCities.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
              >
                {name}
                <XCircle
                  size={18}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCities((prev) =>
                      prev.filter((selectedCity) => selectedCity.id != id),
                    )
                  }
                />
              </li>
            ))}
          </ul>
          {!selectedCities.length && errorMessage.cityError && (
            <p className="p-2 text-sm text-red-500">{errorMessage.cityError}</p>
          )}
        </div>
        {/* Activities */}
        <div>
          <Select<SelectActivities>
            list={activitiesList}
            onClick={(activity: SelectActivities) =>
              !selectedActivities.some(({ id }) => id === activity.id)
                ? setSelectedActivities((prev) => [...prev, activity])
                : null
            }
            type="activity"
          />
          <ul className="flex gap-x-2 p-2 text-white">
            {selectedActivities.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
              >
                {name}
                <XCircle
                  size={18}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedActivities((prev) =>
                      prev.filter(
                        (selectedActivity) => selectedActivity.id != id,
                      ),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button className="flex gap-x-1" onClick={editItinerary}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Select<T extends SelectCountries | SelectCities | SelectActivities>({
  list,
  onClick,
  type,
}: {
  list: T[];
  onClick: (value: T) => void;
  type: "country" | "city" | "activity";
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={!list.length}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          Select a {type}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup className="max-h-[240px] overflow-y-auto">
            {list.map((item) => (
              <CommandItem
                key={item.id}
                value={item.name!}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  onClick(item);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
