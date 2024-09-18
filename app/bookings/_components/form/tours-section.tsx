import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Reorder } from "framer-motion";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronsUpDown, Edit, Plus, Trash } from "lucide-react";
import { cn, listItineraryCities } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { formSchema } from "@/utils/zod-schema";
import { useState } from "react";
import {
  SelectBookingToursWithItineraries,
  SelectCities,
  SelectCountries,
  SelectItineraries,
  SelectToursWithItineraries,
} from "@/drizzle/schema";
import { Itinerary } from "@/types_";
import ForPage from "../for-page";

export function ToursSection({
  form,
  tours,
  tourCountries,
  itineraries,
  setTourCountries,
  setTourCities,
  setItineraries,
  listCitiesHotels,
  setIsItineraryModalOpen,
  setItineraryInitialValues,
  setIsEditItineraryModalOpen,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  tourCountries: SelectCountries[];
  itineraries: Itinerary[];
  setTourCountries: (tours: SelectCountries[]) => void;
  setTourCities: (tours: SelectCities[]) => void;
  setItineraries: (cb: (itineraries: Itinerary[]) => Itinerary[]) => void;
  listCitiesHotels: (tourCities: SelectCities[]) => Promise<void>;
  setIsItineraryModalOpen: (isOpen: boolean) => void;
  setItineraryInitialValues: (itinerary: Itinerary) => void;
  setIsEditItineraryModalOpen: (isOpen: boolean) => void;
}) {
  const [tourOpen, setTourOpen] = useState(false);
  return (
    <section>
      <h2 className="pb-2 text-2xl font-semibold text-sky-900">Tours</h2>
      <div className="grid grid-cols-4 gap-y-2">
        <FormField
          control={form.control}
          name="tour"
          render={({ field }) => (
            <FormItem className="items-center gap-x-4">
              <div className="flex flex-col space-y-2">
                <FormLabel className="block">Tour</FormLabel>
                <Popover open={tourOpen} onOpenChange={setTourOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={tourOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {field.value?.name ? field.value?.name : "Select a tour"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search tour..." />
                      <CommandEmpty>No tour found.</CommandEmpty>
                      <CommandGroup>
                        {tours?.map(({ id, name, countries, itineraries }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={async () => {
                              field.onChange(
                                id === field.value?.id
                                  ? ""
                                  : {
                                      id,
                                      name,
                                    },
                              );
                              setTourOpen(false);
                              setTourCountries(
                                id === field.value?.id ? [] : countries ?? [],
                              );
                              setTourCities(
                                id === field.value?.id
                                  ? []
                                  : itineraries?.reduce<SelectCities[]>(
                                      (acc, curr) => [
                                        ...acc,
                                        ...(curr.cities ?? []),
                                      ],
                                      [],
                                    ) ?? [],
                              );
                              setItineraries(
                                id === field.value?.id
                                  ? () => []
                                  : () => itineraries ?? [],
                              );
                              if (id !== field.value?.id && itineraries.length)
                                await listCitiesHotels(
                                  listItineraryCities(itineraries),
                                );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.id === id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </div>
              <div>
                <ul className="flex flex-wrap gap-2 p-2 text-white">
                  {tourCountries?.map(({ name }, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </FormItem>
          )}
        />
        {!!tourCountries?.length && (
          <div className="col-span-full space-y-2">
            <div className="flex w-full justify-end">
              <ForPage type="single" page="/bookings">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsItineraryModalOpen(true)}
                  className="flex h-8 gap-x-1"
                >
                  <Plus size={16} />
                  Add itinerary
                </Button>
              </ForPage>
            </div>
            <Reorder.Group
              axis="x"
              values={itineraries?.map(({ id }) => id)}
              onReorder={(newOrd) =>
                setItineraries((prev) =>
                  (
                    newOrd?.map((id) => {
                      const itinerary = prev.find((item) => item.id === id)!;
                      return itinerary;
                    }) as SelectItineraries[]
                  )?.map((itinerary, i) => ({
                    ...itinerary,
                    day: `Day ${i + 1}`,
                  })),
                )
              }
              layoutScroll
              className="flex w-full flex-nowrap overflow-x-auto border"
            >
              {itineraries?.map(
                (
                  { id, day, activities, cities, optionalActivities, tourId },
                  i,
                ) => (
                  <Reorder.Item
                    key={id}
                    value={id}
                    className="flex max-w-min cursor-grab items-start justify-between border-l border-neutral-200 bg-white p-2 first:border-none"
                  >
                    <div className="flex flex-col gap-y-1">
                      <span className="font-medium">Day {i + 1}</span>
                      <span className="text-sm">
                        {form.watch("arrivalDepartureDate.from")
                          ? format(
                              addDays(
                                form.watch("arrivalDepartureDate.from")!,
                                i,
                              ),
                              "dd-MM-yyyy",
                            )
                          : null}
                      </span>
                      <div className="flex items-start gap-x-2 text-sm">
                        <span className="font-medium">Cities:</span>
                        <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
                          {cities?.map(({ id, name }) => (
                            <li
                              key={id}
                              className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-start gap-x-2 text-sm">
                        <span className="font-medium">Activities:</span>
                        <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
                          {activities?.map(({ id, name }) => (
                            <li
                              key={id}
                              className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {!!optionalActivities?.length && (
                        <div className="flex items-start gap-x-2 text-sm">
                          <span className="whitespace-nowrap font-medium">
                            Optional Activities:
                          </span>
                          <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
                            {optionalActivities?.map(({ id, name }) => (
                              <li
                                key={id}
                                className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-sky-700 px-2 py-0.5 text-sm font-medium"
                              >
                                {name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-x-2">
                      <Edit
                        size={18}
                        className="cursor-pointer text-neutral-600"
                        onClick={() => {
                          setItineraryInitialValues({
                            id,
                            day,
                            cities,
                            activities,
                            optionalActivities,
                            tourId,
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
                              ?.map((itinerary, i) => ({
                                ...itinerary,
                                day: `Day ${i + 1}`,
                              })),
                          );
                        }}
                      />
                    </div>
                  </Reorder.Item>
                ),
              )}
            </Reorder.Group>
          </div>
        )}
      </div>
    </section>
  );
}
