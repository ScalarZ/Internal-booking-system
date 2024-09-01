"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCallback, useEffect, useState } from "react";

import {
  SelectActivities,
  SelectCities,
  SelectCountries,
  SelectItineraries,
} from "@/drizzle/schema";
import { createClient } from "@/utils/supabase/client";
import { activitySchema, citySchema } from "@/utils/zod-schema";
import { z } from "zod";
import { generateRandomId } from "@/utils/generate-random-id";
import Select from "./select";
import { XCircle } from "lucide-react";

const supabase = createClient();

const initialErrorMessage = {
  activityError: "",
  cityError: "",
};

type Itinerary =
  | (Omit<SelectItineraries, "id" | "createdAt" | "updatedAt"> & {
      id: string | number;
    })
  | (Omit<SelectItineraries, "id" | "createdAt" | "updatedAt" | "tourId"> & {
      id: string | number;
    });

export default function ItineraryModal<T extends Itinerary>({
  day,
  isOpen,
  selectedCountries,
  initialValues,
  setIsOpen,
  setItineraries,
  setInitialValues,
}: {
  day?: string;
  isOpen: boolean;
  initialValues?: T;
  selectedCountries: SelectCountries[];
  setIsOpen: (value: boolean) => void;
  setItineraries: (cb: (itinerary: T[]) => T[]) => void;
  setInitialValues?: (initialValues: T | null) => void;
}) {
  const [selectedCities, setSelectedCities] = useState<SelectCities[]>(
    initialValues?.cities ?? [],
  );
  const [selectedActivities, setSelectedActivities] = useState<
    SelectActivities[]
  >(initialValues?.activities ?? []);
  const [selectedOptionalActivities, setSelectedOptionalActivities] = useState<
    SelectActivities[]
  >(initialValues?.optionalActivities ?? []);
  const [citiesList, setCitiesList] = useState<SelectCities[]>([]);
  const [activitiesList, setActivitiesList] = useState<SelectActivities[]>([]);
  const [optionalActivitiesList, setOptionalActivitiesList] = useState<
    SelectActivities[]
  >([]);
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);

  function resetModalInputs() {
    resetItineraryInputs();
    setErrorMessage(initialErrorMessage);
  }

  function resetItineraryInputs() {
    setSelectedCities([]);
    setSelectedActivities([]);
    setActivitiesList([]);
    setSelectedOptionalActivities([]);
    setOptionalActivitiesList([]);
    setInitialValues?.(null);
  }

  function checkForItineraryErrorMessage() {
    const inputs = {
      cityError: {
        value: selectedCities?.length,
        message: "Please select a city",
      },
      activityError: {
        value: selectedActivities?.length,
        message: "Please select an activity",
      },
    };

    Object.entries(inputs).forEach((input) => {
      if (!input[1].value) {
        setErrorMessage((prev) => ({
          ...prev,
          [input[0]]: input[1].message,
        }));
      }
    });

    return Object.values(inputs).every((input) => input.value);
  }
  function addItinerary() {
    if (!checkForItineraryErrorMessage()) return;
    setItineraries((prev) => [
      ...prev,
      {
        id: generateRandomId(),
        cities: selectedCities,
        activities: selectedActivities,
        optionalActivities: selectedOptionalActivities,
        day: `Day ${prev.length + 1}`,
      } as T,
    ]);
    setIsOpen(false);
    resetItineraryInputs();
  }

  function editItinerary() {
    setItineraries((prev) =>
      prev?.map((itinerary) => {
        if (itinerary.id === initialValues?.id) {
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

  function handleAction() {
    if (initialValues) {
      editItinerary();
    } else {
      addItinerary();
    }
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

  const getActivities = useCallback(async (cities: string[]) => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(
          "id, name, countryId:country_id, cityId:city_id, isOptional:is_optional",
        )
        .in("city_id", cities)
        .eq("is_optional", true);

      if (error) throw error;

      const activities = z.array(activitySchema).parse(data);
      setActivitiesList(activities);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getOptionalActivities = useCallback(async (cities: string[]) => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(
          "id, name, countryId:country_id, cityId:city_id, isOptional:is_optional",
        )
        .in("city_id", cities)
        .eq("is_optional", false);

      if (error) throw error;

      const activities = z.array(activitySchema).parse(data);
      setOptionalActivitiesList(activities);
    } catch (err) {
      console.error(err);
    }
  }, []);

  function RemoveSelectedCity(id: string) {
    setSelectedCities((prev) =>
      prev.filter((selectedCity) => selectedCity.id != id),
    );
    setSelectedActivities((prev) =>
      prev.filter((selectedActivity) => selectedActivity.cityId != id),
    );
    setSelectedOptionalActivities((prev) =>
      prev.filter(
        (selectedOptionalActivity) => selectedOptionalActivity.cityId != id,
      ),
    );
    setActivitiesList((prev) =>
      prev.filter((activity) => activity.cityId != id),
    );
    setOptionalActivitiesList((prev) =>
      prev.filter((activity) => activity.cityId != id),
    );
  }

  useEffect(() => {
    if (!selectedCountries?.length) return;
    getCities();
    if (!initialValues?.cities) return;
    getActivities(initialValues.cities.map(({ id }) => id));
    getOptionalActivities(initialValues.cities.map(({ id }) => id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries]);

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
          <DialogTitle>Add Itinerary</DialogTitle>
        </DialogHeader>
        <span className="font-medium">{initialValues?.day ?? day}</span>
        {/* Cities */}
        <div>
          <Select<SelectCities>
            list={citiesList}
            onClick={async (city: SelectCities) => {
              if (selectedCities.some(({ id }) => id === city.id)) return;
              setSelectedCities((prev) => [...prev, city]);
              await Promise.allSettled([
                getActivities([...selectedCities.map(({ id }) => id), city.id]),
                getOptionalActivities([
                  ...selectedCities.map(({ id }) => id),
                  city.id,
                ]),
              ]);
            }}
            type="city"
          />
          {!selectedCities?.length && errorMessage.cityError && (
            <p className="p-2 text-sm text-red-500">{errorMessage.cityError}</p>
          )}
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
                  onClick={() => RemoveSelectedCity(id)}
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
          {!selectedActivities?.length && errorMessage.activityError && (
            <p className="p-2 text-sm text-red-500">
              {errorMessage.activityError}
            </p>
          )}
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
          <Button className="flex gap-x-1" onClick={handleAction}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
