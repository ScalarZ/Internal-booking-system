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
import { Loader, XCircle, Edit, Trash } from "lucide-react";
import {
  SelectActivities,
  SelectCities,
  SelectCountries,
  SelectItineraries,
  SelectToursWithItineraries,
} from "@/drizzle/schema";
import { createClient } from "@/utils/supabase/client";
import { activitySchema, citySchema } from "@/utils/zod-schema";
import { z } from "zod";
import { addTour, updateTour } from "@/utils/db-queries/tour";
import { Reorder } from "framer-motion";
import { generateRandomId } from "@/utils/generate-random-id";
import Select from "@/app/bookings/_components/select";
import ItineraryModal from "@/app/bookings/_components/itinerary-modal";

const supabase = createClient();

const initialError = {
  nameError: "",
  countryError: "",
};

const itineraryInitialError = {
  cityError: "",
  activityError: "",
};

type Itinerary = Omit<
  SelectItineraries,
  "id" | "createdAt" | "updatedAt" | "tourId"
> & {
  id: string | number;
};

export default function TourModal({
  modalMode,
  isOpen,
  countriesList,
  initialValues,
  setIsOpen,
  setInitialValues,
}: {
  modalMode: "add" | "edit";
  isOpen: boolean;
  countriesList: SelectCountries[];
  initialValues?: SelectToursWithItineraries;
  setIsOpen: (val: boolean) => void;
  setInitialValues?: (tour: SelectToursWithItineraries | null) => void;
}) {
  const [itineraryInitialValues, setItineraryInitialValues] =
    useState<Itinerary | null>(null);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [selectedCountries, setSelectedCountries] = useState<SelectCountries[]>(
    initialValues?.countries ?? [],
  );
  const [selectedCities, setSelectedCities] = useState<SelectCities[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<
    SelectActivities[]
  >([]);
  const [selectedOptionalActivities, setSelectedOptionalActivities] = useState<
    SelectActivities[]
  >([]);
  const [citiesList, setCitiesList] = useState<SelectCities[]>([]);
  const [activitiesList, setActivitiesList] = useState<SelectActivities[]>([]);
  const [optionalActivitiesList, setOptionalActivitiesList] = useState<
    SelectActivities[]
  >([]);
  const [isEditItineraryModalOpen, setIsEditItineraryModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [itineraries, setItineraries] = useState<Itinerary[]>(
    initialValues?.itineraries ?? [],
  );
  const [itineraryErrorMessage, setItineraryErrorMessage] = useState(
    itineraryInitialError,
  );

  function resetErrorMessage() {
    setErrorMessage(initialError);
    setItineraryErrorMessage(itineraryInitialError);
  }
  function resetModalInputs() {
    setName("");
    setSelectedCountries([]);
    setCitiesList([]);
    setItineraries([]);
    resetErrorMessage();
    resetItineraryInputs();
  }

  function resetItineraryInputs() {
    setSelectedCities([]);
    setSelectedActivities([]);
    setActivitiesList([]);
    setSelectedOptionalActivities([]);
    setOptionalActivitiesList([]);
    setInitialValues?.(null);
  }

  function checkForErrorMessage() {
    const inputs = {
      nameError: { value: name, message: "Please fill up this field" },
      countryError: {
        value: selectedCountries?.length,
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
        setItineraryErrorMessage((prev) => ({
          ...prev,
          [input[0]]: input[1].message,
        }));
      }
    });

    return Object.values(inputs).every((input) => input.value);
  }
  function RemoveSelectedCountry(id: string) {
    setSelectedCountries((prev) =>
      prev.filter((selectedCountry) => selectedCountry.id != id),
    );
    setSelectedCities((prev) =>
      prev.filter((selectedCity) => selectedCity.countryId != id),
    );
    setSelectedActivities((prev) =>
      prev.filter((selectedActivity) => selectedActivity.countryId != id),
    );
    setSelectedOptionalActivities((prev) =>
      prev.filter(
        (selectedOptionalActivity) => selectedOptionalActivity.countryId != id,
      ),
    );
    setCitiesList((prev) => prev.filter((city) => city.countryId != id));
    setActivitiesList((prev) =>
      prev.filter((activity) => activity.countryId != id),
    );
    setOptionalActivitiesList((prev) =>
      prev.filter((activity) => activity.countryId != id),
    );
  }

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

  async function handleAddTour(e: FormEvent) {
    e.preventDefault();
    resetErrorMessage();
    if (!checkForErrorMessage()) {
      return;
    }
    setIsLoading(true);
    try {
      if (modalMode === "edit" && initialValues)
        await updateTour({
          tour: {
            id: initialValues.id,
            name,
            countries: selectedCountries,
          },
          tourItineraries: itineraries.map((itinerary) => ({
            ...itinerary,
            tourId: initialValues.id,
          })),
        });
      else
        await addTour({
          tour: { name, countries: selectedCountries },
          tourItineraries: itineraries?.map(
            ({ id, ...itinerary }) => itinerary,
          ),
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
    if (!checkForItineraryErrorMessage()) {
      return;
    }
    if (modalMode === "edit" && initialValues)
      setItineraries((prev) => [
        ...prev,
        {
          id: generateRandomId(),
          name: "",
          cities: selectedCities,
          activities: selectedActivities,
          optionalActivities: selectedOptionalActivities,
          tourId: initialValues.id,
          day: `Day ${prev?.length + 1}`,
        },
      ]);
    else
      setItineraries((prev) => [
        ...prev,
        {
          id: generateRandomId(),
          name: "",
          cities: selectedCities,
          activities: selectedActivities,
          optionalActivities: selectedOptionalActivities,
          day: `Day ${prev?.length + 1}`,
        },
      ]);
    resetItineraryInputs();
    setItineraryErrorMessage(itineraryInitialError);
  }

  const getCities = useCallback(async (countries: string[]) => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, countryId:country_id")
        .in("country_id", countries);

      if (error) throw error;

      const cities = z.array(citySchema).parse(data);
      setCitiesList(cities);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const getActivities = useCallback(async (cities: string[]) => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("id, name, countryId:country_id, cityId:city_id")
        .in("city_id", cities);

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
        .eq("is_optional", true);

      if (error) throw error;

      const activities = z.array(activitySchema).parse(data);
      setOptionalActivitiesList(activities);
    } catch (err) {
      console.error(err);
    }
  }, []);

  async function handleSelectCountries(country: SelectCountries) {
    if (selectedCountries.some(({ id }) => id === country.id)) return;
    setSelectedCountries((prev) => [...prev, country]);
    await getCities([...selectedCountries.map(({ id }) => id), country.id]);
  }

  useEffect(() => {
    if (modalMode === "edit") {
      getCities([...selectedCountries.map(({ id }) => id)]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalMode]);

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
          <DialogTitle>
            {modalMode === "edit" ? "Edit" : "Add New"} Tour
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Label htmlFor="tour">Name</Label>
          <Input
            className="mt-2"
            id="tour"
            name="tour"
            placeholder="Enter a tour name"
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
            onClick={handleSelectCountries}
            type="country"
          />
          {!selectedCountries?.length && errorMessage.countryError && (
            <p className="p-2 text-sm text-red-500">
              {errorMessage.countryError}
            </p>
          )}
          <ul className="flex gap-x-2 p-2 text-white">
            {selectedCountries?.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
              >
                {name}

                <XCircle
                  size={18}
                  className="cursor-pointer"
                  onClick={() => RemoveSelectedCountry(id)}
                />
              </li>
            ))}
          </ul>
        </div>
        <p className="font-bold">Itinerary</p>
        <span className="font-medium">Day {itineraries?.length + 1}</span>
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
          {!selectedCities?.length && itineraryErrorMessage.cityError && (
            <p className="p-2 text-sm text-red-500">
              {itineraryErrorMessage.cityError}
            </p>
          )}
          <ul className="flex gap-x-2 p-2 text-white">
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
          {!selectedActivities?.length &&
            itineraryErrorMessage.activityError && (
              <p className="p-2 text-sm text-red-500">
                {itineraryErrorMessage.activityError}
              </p>
            )}
          <ul className="flex gap-x-2 p-2 text-white">
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
          {!selectedOptionalActivities?.length &&
            itineraryErrorMessage.activityError && (
              <p className="p-2 text-sm text-red-500">
                {itineraryErrorMessage.activityError}
              </p>
            )}
          <ul className="flex gap-x-2 p-2 text-white">
            {selectedOptionalActivities?.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
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
        <Button className="max-w-max" onClick={addItinerary}>
          Add day
        </Button>
        <div className="max-h-[340px] overflow-y-auto">
          <Reorder.Group
            values={itineraries?.map(({ id }) => id)}
            onReorder={(newOrd) =>
              setItineraries((prev) =>
                (
                  newOrd?.map((id) => {
                    const itinerary = prev.find((item) => item.id === id)!;
                    return itinerary;
                  }) as Itinerary[]
                )?.map((itinerary, i) => ({
                  ...itinerary,
                  day: `Day ${i + 1}`,
                })),
              )
            }
            layoutScroll
          >
            {itineraries?.map(
              ({ id, activities, cities, optionalActivities, day }, i) => (
                <Reorder.Item
                  key={id}
                  value={id}
                  className="flex cursor-grab items-start justify-between border-t border-neutral-200 bg-white p-2 first:border-none"
                >
                  <div className="flex flex-col gap-y-1">
                    <span className="font-medium">{day}</span>
                    <div className="flex items-center gap-x-2 text-sm">
                      <span className="font-medium">Cities:</span>
                      <ul className="flex gap-x-1 text-white">
                        {cities?.map(({ id, name }) => (
                          <li
                            key={id}
                            className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-x-2 text-sm">
                      <span className="font-medium">Activities:</span>
                      <ul className="flex gap-x-1 text-white">
                        {activities?.map(({ id, name }) => (
                          <li
                            key={id}
                            className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-x-2 text-sm">
                      <span className="font-medium">Optional Activities:</span>
                      <ul className="flex gap-x-1 text-white">
                        {optionalActivities?.map(({ id, name }) => (
                          <li
                            key={id}
                            className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-x-2">
                    <Edit
                      size={18}
                      className="cursor-pointer text-neutral-600"
                      onClick={() => {
                        setItineraryInitialValues({
                          id,
                          cities,
                          activities,
                          optionalActivities,
                          day: `Day ${i + 1}`,
                        });
                        setIsEditItineraryModalOpen(true);
                      }}
                    />
                    <Trash
                      size={18}
                      className="cursor-pointer text-red-500"
                      onClick={() => {
                        setItineraries((prev) =>
                          prev.filter((itinerary) => itinerary.id !== id),
                        );
                      }}
                    />
                  </div>
                </Reorder.Item>
              ),
            )}
          </Reorder.Group>
        </div>
        {isEditItineraryModalOpen && itineraryInitialValues && (
          <ItineraryModal
            initialValues={itineraryInitialValues}
            isOpen={isEditItineraryModalOpen}
            selectedCountries={selectedCountries}
            setIsOpen={setIsEditItineraryModalOpen}
            setInitialValues={setItineraryInitialValues}
            setItineraries={setItineraries}
          />
        )}
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant={"outline"}
            onClick={() => {
              setIsOpen(false);
            }}
          >
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
