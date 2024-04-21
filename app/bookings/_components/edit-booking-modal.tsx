"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Edit,
  Loader,
  Plus,
  Trash,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  SelectBookings,
  SelectCities,
  SelectCompanies,
  SelectCountries,
  SelectHotels,
  SelectNationalities,
  SelectNileCruises,
  SelectTours,
} from "@/drizzle/schema";
import capitalize from "@/utils/capitalize";
import { updateBooking } from "@/utils/db-queries/booking";
import { getCitiesHotels } from "@/utils/db-queries/hotel";
import EditItineraryModal from "@/app/create/tours/_components/edit-itinerary-modal";
import AddItineraryModal from "./create-itinerary-modal";
import { Reorder } from "framer-motion";
import { getTourCities } from "@/utils/db-queries/tour";

export default function EditBookingModal({
  companies,
  tours,
  nileCruises,
  nationalities,
  initialValues,
  isOpen,
  setIsOpen,
  setInitialValues,
}: {
  companies: SelectCompanies[];
  tours: SelectTours[];
  nileCruises: SelectNileCruises[];
  nationalities: SelectNationalities[];
  isOpen: boolean;
  initialValues: SelectBookings;
  setIsOpen: (value: boolean) => void;
  setInitialValues: (value: SelectBookings | null) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-[1360px] gap-y-4 overflow-y-auto">
        <DialogHeader className="capitalize">
          <DialogTitle>Update Booking</DialogTitle>
        </DialogHeader>
        <From
          initialValues={initialValues}
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
          closeModal={() => setIsOpen(false)}
          setInitialValues={setInitialValues}
        />
      </DialogContent>
    </Dialog>
  );
}

const formSchema = z.object({
  pax: z.number({ required_error: "Please enter a number" }).min(1),
  internalBookingId: z
    .string({
      required_error: "Please enter an internal booking id",
    })
    .optional(),
  referenceBookingId: z.string().optional(),
  tour: z.string({ required_error: "Please select a tour" }),
  company: z.string({ required_error: "Please select a company" }),
  currency: z.string({ required_error: "Please select a currency" }),
  arrivalDate: z.date({ required_error: "Please select an arrival date" }),
  departureDate: z.date({ required_error: "Please select an departure date" }),
  hotels: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Please select at least one hotel.",
  }),
  nileCruises: z.array(z.string()).optional(),
  singleRoom: z.number().optional(),
  doubleRoom: z.number().optional(),
  tripleRoom: z.number().optional(),
  roomNote: z.string().optional(),
  internalFlights: z.boolean().default(false),
  internalFlightsNote: z.string().optional(),
  visa: z.boolean().default(false),
  tips: z.number({ required_error: "Please enter tips" }),
  nationality: z.string({ required_error: "Please select a nationality" }),
  language: z.string({ required_error: "Please select a language" }),
  generalNote: z.string().optional(),
  status: z.boolean().default(true),
});

export function From({
  companies,
  tours,
  nileCruises,
  nationalities,
  initialValues,
  setInitialValues,
  closeModal,
}: {
  companies: SelectCompanies[];
  tours: SelectTours[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  initialValues: SelectBookings;
  closeModal: () => void;
  setInitialValues: (value: SelectBookings | null) => void;
}) {
  const [name, setName] = useState("");
  const [internalBookingId, setInternalBookingId] = useState("");
  const [tourOpen, setTourOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [nileCruiseOpen, setNileCruiseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditItineraryModalOpen, setIsEditItineraryModalOpen] =
    useState(false);
  const [addItineraryModalOpen, setAddItineraryModalOpen] = useState(false);
  const [touristsNames, setTouristsNames] = useState<string[]>(
    initialValues.tourists ?? [],
  );
  const [tourCountries, setTourCountries] = useState<SelectCountries[]>([]);
  const [tourCities, setTourCities] = useState<SelectCities[]>([]);
  const [citiesHotels, setCitiesHotels] = useState<SelectHotels[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>(
    initialValues.itinerary ?? [],
  );
  const [itineraryInitialValues, setItineraryInitialValues] =
    useState<Itinerary | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotels: (initialValues.hotels as string[]) ?? [],
      pax: initialValues.pax ?? undefined,
      internalBookingId: initialValues.internalBookingId ?? undefined,
      arrivalDate: initialValues.arrivalDate ?? undefined,
      company: initialValues.company ?? undefined,
      currency: initialValues.currency ?? undefined,
      departureDate: initialValues.departureDate ?? undefined,
      internalFlights: initialValues.internalFlights ?? undefined,
      internalFlightsNote: initialValues.internalFlightsNote ?? undefined,
      generalNote: initialValues.generalNote ?? undefined,
      singleRoom: initialValues.single ?? undefined,
      doubleRoom: initialValues.double ?? undefined,
      tripleRoom: initialValues.triple ?? undefined,
      roomNote: initialValues.roomNote ?? undefined,
      language: initialValues.language ?? undefined,
      nationality: initialValues.nationality ?? undefined,
      referenceBookingId: initialValues.referenceBookingId ?? undefined,
      tips: initialValues.tips ?? undefined,
      tour: initialValues.tour ?? undefined,
      visa: initialValues.visa ?? undefined,
      nileCruises: initialValues.nileCruises ?? undefined,
      status: initialValues.status ?? undefined,
    },
  });

  async function listCitiesHotels() {
    try {
      const hotels = await getCitiesHotels(tourCities.map(({ id }) => id));
      setCitiesHotels(hotels);
    } catch (error) {
      console.error(error);
    }
  }

  async function listTourCountries() {
    if (!initialValues.tour) return;
    try {
      const tour = await getTourCities(initialValues.tour);
      setTourCountries(tour[0].countries ?? []);
      setTourCities(
        tour[0].itinerary?.reduce<SelectCities[]>(
          (acc, curr) => [...acc, ...curr.cities],
          [],
        ) ?? [],
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!tourCities.length) return;
    listCitiesHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourCities]);

  useEffect(() => {
    listTourCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateBooking({
        id: initialValues.id,
        arrivalDate: values.arrivalDate,
        company: values.company,
        currency: values.currency,
        departureDate: values.departureDate,
        double: values.doubleRoom ?? 0,
        generalNote: values.generalNote ?? null,
        hotels: values.hotels,
        internalBookingId,
        internalFlights: values.internalFlights,
        internalFlightsNote: values.internalFlightsNote ?? null,
        language: values.language,
        nationality: values.nationality,
        roomNote: values.roomNote ?? null,
        pax: values.pax,
        referenceBookingId: values.referenceBookingId ?? null,
        single: values.singleRoom ?? 0,
        tips: values.tips,
        tour: values.tour,
        tourists: touristsNames,
        triple: values.tripleRoom ?? 0,
        visa: values.visa,
        countries: tourCountries?.map(({ name }) => `${name}`),
        status: values.status,
        itinerary: itineraries,
        nileCruises: values.nileCruises ?? null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      form.reset();
      closeModal();
      setInitialValues(null);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 gap-x-8 gap-y-8">
          <FormField
            control={form.control}
            name="pax"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>PAX</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    value={Math.max(field.value, 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem className="flex flex-col justify-start">
            <FormLabel>Tourist names</FormLabel>
            <div className="flex gap-x-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={
                  !form.watch("pax") ||
                  touristsNames.length >= form.watch("pax")
                }
              />
              <Button
                type="button"
                variant="secondary"
                disabled={
                  !name ||
                  !form.watch("pax") ||
                  touristsNames.length >= form.watch("pax")
                }
                onClick={() => {
                  setTouristsNames((prev) => [...prev, name]);
                  setName("");
                }}
                className="flex gap-x-1"
              >
                <Plus size={16} />
                Add
              </Button>
            </div>
            <FormDescription className="flex gap-x-2">
              <p>This fields depends on the PAX number</p>
              <span>
                {touristsNames.length}/
                {!isNaN(form.watch("pax")) ? form.watch("pax") : 0}
              </span>
            </FormDescription>
            <div>
              <ul className="flex flex-wrap gap-2 p-2 text-white">
                {touristsNames.map((name, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
                  >
                    {name}
                    <XCircle
                      size={18}
                      className="cursor-pointer"
                      onClick={() =>
                        setTouristsNames((prev) =>
                          prev.filter((_, index) => index != i),
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
            <FormMessage />
          </FormItem>
          <FormField
            control={form.control}
            name="internalBookingId"
            disabled
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Internal Booking ID</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormDescription className="flex gap-x-2">
                  Generated when selecting a company
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceBookingId"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Reference Booking ID</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="singleRoom"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Single room</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doubleRoom"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Double room</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tripleRoom"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Triple room</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tour"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Tour</FormLabel>
                <Popover open={tourOpen} onOpenChange={setTourOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tourOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {field.value ? field.value : "Select a tour"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search tour..." />
                      <CommandEmpty>No tour found.</CommandEmpty>
                      <CommandGroup>
                        {tours.map(({ id, name, countries, itinerary }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setTourOpen(false);
                              setTourCountries(
                                name === field.value ? [] : countries ?? [],
                              );
                              setTourCities(
                                name === field.value
                                  ? []
                                  : itinerary?.reduce<SelectCities[]>(
                                      (acc, curr) => [...acc, ...curr.cities],
                                      [],
                                    ) ?? [],
                              );
                              setItineraries(
                                name === field.value ? [] : itinerary ?? [],
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === name
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
                <div>
                  <ul className="flex flex-wrap gap-2 p-2 text-white">
                    {tourCountries.map(({ name }, i) => (
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
          {!!itineraries.length && (
            <div className="col-span-full space-y-2">
              <div className="flex w-full justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddItineraryModalOpen(true)}
                  className="flex h-8 gap-x-1"
                >
                  <Plus size={16} />
                  Add itinerary
                </Button>
              </div>
              <Reorder.Group
                axis="x"
                values={itineraries.map(({ id }) => id)}
                onReorder={(newOrd) =>
                  setItineraries((prev) =>
                    (
                      newOrd.map((id) => {
                        const itinerary = prev.find((item) => item.id === id)!;
                        return itinerary;
                      }) as Itinerary[]
                    ).map((itinerary, i) => ({
                      ...itinerary,
                      day: `Day ${i + 1}`,
                    })),
                  )
                }
                layoutScroll
                className="flex w-full flex-nowrap overflow-x-auto border"
              >
                {itineraries.map(({ id, day, activities, cities }) => (
                  <Reorder.Item
                    key={id}
                    value={id}
                    className="flex max-w-min cursor-grab items-start justify-between border-l border-neutral-200 bg-white p-2 first:border-none"
                  >
                    <div className="flex flex-col gap-y-1">
                      <span className="font-medium">{day}</span>
                      <div className="flex items-start gap-x-2 text-sm">
                        <span className="font-medium">Cities:</span>
                        <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
                          {cities.map(({ id, name }) => (
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
                          {activities.map(({ id, name }) => (
                            <li
                              key={id}
                              className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
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
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
          <FormField
            control={form.control}
            name="hotels"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Hotels</FormLabel>
                <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
                  <PopoverTrigger asChild disabled={!citiesHotels.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={hotelsOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {field.value.length
                        ? field.value.map((hotel) => capitalize(`${hotel}, `))
                        : "Select hotels"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search hotel..." />
                      <CommandEmpty>No hotel found.</CommandEmpty>
                      <CommandGroup>
                        {citiesHotels.map(({ id, name }) => (
                          <CommandItem key={id}>
                            <FormField
                              control={form.control}
                              name="hotels"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={name}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          name ?? "",
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                name,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== name,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nileCruises"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Nile Cruises</FormLabel>
                <Popover open={nileCruiseOpen} onOpenChange={setNileCruiseOpen}>
                  <PopoverTrigger asChild disabled={!nileCruises.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={nileCruiseOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {field.value?.length
                        ? field.value?.map((hotel) => capitalize(`${hotel}, `))
                        : "Select a nile cruises"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search hotel..." />
                      <CommandEmpty>No nile cruise found.</CommandEmpty>
                      <CommandGroup>
                        {nileCruises.map(({ id, name }) => (
                          <CommandItem key={id}>
                            <FormField
                              control={form.control}
                              name="nileCruises"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={name}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          name ?? "",
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value ?? []),
                                                name,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== name,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Company</FormLabel>
                <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={companyOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {field.value ? field.value : "Select a company"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search company..." />
                      <CommandEmpty>No company found.</CommandEmpty>
                      <CommandGroup>
                        {companies.map(({ id, name, companyId }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setCompanyOpen(false);
                              const id = `${companyId ?? ""}-${(
                                Math.random() * 36
                              )
                                .toString(36)
                                .substring(2, 7)}`;
                              form.setValue(
                                "internalBookingId",
                                name === field.value ? "" : id,
                              );
                              setInternalBookingId(
                                name === field.value ? "" : id,
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === name
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
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["USD", "EUR", "EGP"].map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Nationality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nationality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nationalities.map(({ name, id }) => (
                      <SelectItem key={id} value={name ?? ""}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "Spanish",
                      "Portuguese",
                      "English",
                      "French",
                      "Italian",
                    ].map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tips"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Tips</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Arrival date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Departure date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="internalFlights"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <div className="space-y-0.5">
                  <FormLabel>Internal flights included?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visa"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <div className="space-y-0.5">
                  <FormLabel>Visa included?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <div className="space-y-0.5">
                  <FormLabel>Status</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="internalFlightsNote"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Internal flight note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomNote"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Rooms note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="generalNote"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>General note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
      {itineraryInitialValues && (
        <EditItineraryModal
          initialValues={itineraryInitialValues}
          isOpen={isEditItineraryModalOpen}
          selectedCountries={tourCountries}
          setIsOpen={setIsEditItineraryModalOpen}
          setInitialValues={setItineraryInitialValues}
          setItineraries={setItineraries}
        />
      )}
      {!!itineraries.length && (
        <AddItineraryModal
          day={`Day ${itineraries.length + 1}`}
          isOpen={addItineraryModalOpen}
          setIsOpen={setAddItineraryModalOpen}
          selectedCountries={tourCountries}
          setItineraries={setItineraries}
        />
      )}
    </Form>
  );
}
