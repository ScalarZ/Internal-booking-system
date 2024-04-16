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
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Loader,
  Check,
  ChevronsUpDown,
  X,
  XCircle,
  Edit,
  Trash,
} from "lucide-react";
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
import EditItineraryModal from "./edit-itinerary-modal";
import { addTour } from "@/utils/db-queries/tour";

const supabase = createClient();

export default function CreateButton({
  countriesList,
}: {
  countriesList: SelectCountries[];
}) {
  const [itineraryInitialValues, setItineraryInitialValues] =
    useState<Itinerary | null>(null);

  const [name, setName] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<SelectCountries[]>(
    [],
  );
  const [selectedCities, setSelectedCities] = useState<SelectCities[]>([]);
  const [citiesList, setCitiesList] = useState<SelectCities[]>([]);
  const [activitiesList, setActivitiesList] = useState<SelectActivities[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<
    SelectActivities[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditItineraryModalOpen, setIsEditItineraryModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    nameError: "",
    countryError: "",
    cityError: "",
  });
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  function resetErrorMessage() {
    setErrorMessage({ nameError: "", countryError: "", cityError: "" });
  }
  function resetModalInputs() {
    setName("");
    setSelectedCountries([]);
    setSelectedCities([]);
    setSelectedActivities([]);
    setCitiesList([]);
    setActivitiesList([]);
    setItineraries([]);
    resetErrorMessage();
  }

  function resetItineraryInputs() {
    setSelectedCities([]);
    setSelectedActivities([]);
  }

  function checkForErrorMessage() {
    const inputs = {
      nameError: { value: name, message: "Please fill up this field" },
      countryError: {
        value: selectedCountries.length,
        message: "Please add a country",
      },
    };

    Object.entries(inputs).forEach((input) => {
      if (!input[1].value) {
        setErrorMessage((prev) => ({ ...prev, [input[0]]: input[1].message }));
      }
    });

    return Object.values(inputs).every((input) => input.value);
  }

  async function handleAddTour(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      await addTour({
        name,
        itinerary: itineraries,
        countries: selectedCountries,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      resetModalInputs();
    }
  }

  function addItinerary() {
    setItineraries((prev) => [
      ...prev,
      {
        day: `Day ${itineraries.length + 1}`,
        cities: selectedCities,
        activities: selectedActivities,
      },
    ]);
    resetItineraryInputs();
  }

  const getCities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, countryId:country_id")
        .in(
          "country_id",
          selectedCountries.map(({ id }) => id),
        );

      if (error) throw error;

      const cities = z.array(citySchema).parse(data);
      setCitiesList(cities);
    } catch (err) {
      console.error(err);
    }
  }, [selectedCountries]);

  const getActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("id, name, countryId:country_id, cityId:city_id")
        .in(
          "city_id",
          selectedCities.map(({ id }) => id),
        );

      if (error) throw error;

      const activities = z.array(activitySchema).parse(data);
      setActivitiesList(activities);
    } catch (err) {
      console.error(err);
    }
  }, [selectedCities]);

  useEffect(() => {
    if (!selectedCountries.length) return;
    getCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries]);

  useEffect(() => {
    if (!selectedCities.length) return;
    getActivities();
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
      <DialogTrigger className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-sky-900 px-4 py-2 text-sm font-medium text-sky-50 ring-offset-white transition-colors hover:bg-sky-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-sky-50 dark:text-sky-900 dark:ring-offset-sky-950 dark:hover:bg-sky-50/90 dark:focus-visible:ring-sky-300">
        Add
      </DialogTrigger>
      <DialogContent className="gap-y-2">
        <DialogHeader>
          <DialogTitle>Add New Tour</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Label htmlFor="country">Name</Label>
          <Input
            className="mt-2"
            id="country"
            name="country"
            placeholder="Enter a country name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {!name.trim() && errorMessage.nameError && (
            <p className="p-2 text-sm text-red-500">{errorMessage.nameError}</p>
          )}
        </div>
        {/* Countries */}
        <div>
          <Select<SelectCountries>
            list={countriesList}
            onClick={(country: SelectCountries) =>
              !selectedCountries.some(({ id }) => id === country.id)
                ? setSelectedCountries((prev) => [...prev, country])
                : null
            }
            type="country"
          />
          {!selectedCountries.length && errorMessage.countryError && (
            <p className="p-2 text-sm text-red-500">
              {errorMessage.countryError}
            </p>
          )}
          <ul className="flex gap-x-2 p-2 text-white">
            {selectedCountries.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
              >
                {name}

                <XCircle
                  size={18}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCountries((prev) =>
                      prev.filter(
                        (selectedCountry) => selectedCountry.id != id,
                      ),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        <p className="font-bold">Itinerary</p>
        <span className="font-medium">Day {itineraries.length + 1}</span>
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
        <Button className="max-w-max" onClick={addItinerary}>
          Add day
        </Button>
        <div className="max-h-[340px] overflow-y-auto">
          {itineraries.map(({ day, activities, cities }) => (
            <div
              key={day}
              className="flex items-start justify-between border-t border-neutral-200 p-2 first:border-none"
            >
              <div>
                <p>{day}</p>
                <p>Cities: {cities.map(({ name }) => name).join(", ")}</p>
                <p>
                  Activities: {activities.map(({ name }) => name).join(", ")}
                </p>
              </div>
              <div className="flex gap-x-2">
                <Edit
                  size={18}
                  className="cursor-pointer text-neutral-600"
                  onClick={() => {
                    setItineraryInitialValues({
                      day,
                      cities,
                      activities,
                    });
                    setIsEditItineraryModalOpen(true);
                  }}
                />
                <Trash
                  size={18}
                  className="cursor-pointer text-red-500"
                  onClick={() => {
                    setItineraries((prev) =>
                      prev
                        .filter((itinerary) => itinerary.day !== day)
                        .map((itinerary, i) => ({
                          ...itinerary,
                          day: `Day ${i + 1}`,
                        })),
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {itineraryInitialValues && (
          <EditItineraryModal
            initialValues={itineraryInitialValues}
            isOpen={isEditItineraryModalOpen}
            selectedCountries={selectedCountries}
            setIsOpen={setIsEditItineraryModalOpen}
            setInitialValues={setItineraryInitialValues}
            setItineraries={setItineraries}
          />
        )}
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button className="flex gap-x-1" onClick={handleAddTour}>
            {isLoading && <Loader size={14} className="animate-spin" />}
            Submit
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
