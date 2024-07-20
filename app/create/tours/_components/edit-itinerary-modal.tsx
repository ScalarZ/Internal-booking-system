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
  initialValues,
  selectedCountries,
  setIsOpen,
  setItineraries,
  setInitialValues,
}: {
  isOpen: boolean;
  initialValues: Itinerary;
  selectedCountries: SelectCountries[];
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
  const [selectedOptionalActivities, setSelectedOptionalActivities] = useState<
    SelectActivities[]
  >(initialValues.optionalActivities ?? []);
  const [citiesList, setCitiesList] = useState<SelectCities[]>([]);
  const [activitiesList, setActivitiesList] = useState<SelectActivities[]>([]);
  const [optionalActivitiesList, setOptionalActivitiesList] = useState<
    SelectActivities[]
  >([]);
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
      prev?.map((itinerary) => {
        if (itinerary.day === initialValues?.day) {
          itinerary.cities = selectedCities;
          itinerary.activities = selectedActivities;
          itinerary.optionalActivities = selectedOptionalActivities;
        }
        return itinerary;
      }),
    );
    setIsOpen(false);
    resetItineraryInputs();
  }

  const getCities = useCallback(async () => {
    setCitiesList([]);
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, countryId:country_id")
        .in(
          "country_id",
          selectedCountries?.map(({ id }) => id),
        );

      if (error) throw error;

      const cities = z.array(citySchema).parse(data);
      setCitiesList(cities);
    } catch (err) {
      console.error(err);
    }
  }, [selectedCountries]);

  const getActivities = useCallback(async () => {
    setActivitiesList([]);
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(
          "id, name, countryId:country_id, cityId:city_id, isOptional:is_optional",
        )
        .in(
          "city_id",
          selectedCities?.map(({ id }) => id),
        )
        .eq("is_optional", true);
      if (error) throw error;

      const activities = z.array(activitySchema).parse(data);
      setActivitiesList(activities);
    } catch (err) {
      console.error(err);
    }
  }, [selectedCities]);

  const getOptionalActivities = useCallback(async () => {
    setOptionalActivitiesList([]);
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(
          "id, name, countryId:country_id, cityId:city_id, isOptional:is_optional",
        )
        .in(
          "city_id",
          selectedCities?.map(({ id }) => id),
        )
        .eq("is_optional", false);

      if (error) throw error;

      const activities = z.array(activitySchema).parse(data);
      setOptionalActivitiesList(activities);
    } catch (err) {
      console.error(err);
    }
  }, [selectedCities]);

  useEffect(() => {
    if (!selectedCountries?.length) return;
    getCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries]);

  useEffect(() => {
    if (!selectedCities?.length) return;
    getActivities();
    getOptionalActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCities]);

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
          <ul className="flex flex-wrap gap-2 p-2 text-white">
            {selectedCities?.map(({ id, name }) => (
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
          {!selectedCities?.length && errorMessage.cityError && (
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
          <ul className="flex flex-wrap gap-2 p-2 text-white">
            {selectedActivities?.map(({ id, name }) => (
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
        {/* Optional Activities */}
        <div>
          <Select<SelectActivities>
            list={optionalActivitiesList}
            onClick={(activity: SelectActivities) =>
              !selectedOptionalActivities.some(({ id }) => id === activity.id)
                ? setSelectedOptionalActivities((prev) => [...prev, activity])
                : null
            }
            type="optional activity"
          />
          <ul className="flex flex-wrap gap-2 p-2 text-white">
            {selectedOptionalActivities?.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 rounded-full bg-sky-700 px-2 py-1 text-sm font-medium"
              >
                {name}
                <XCircle
                  size={18}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedOptionalActivities((prev) =>
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
  type: "country" | "city" | "activity" | "optional activity";
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={!list?.length}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
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
            {list?.map((item) => (
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
