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
  X,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
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
import { getCitiesHotels, getCityHotels } from "@/utils/db-queries/hotel";
import EditItineraryModal from "@/app/create/tours/_components/edit-itinerary-modal";
import AddItineraryModal from "./create-itinerary-modal";
import { Reorder } from "framer-motion";
import { getTourCities } from "@/utils/db-queries/tour";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateRandomId } from "@/utils/generate-random-id";

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
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-4 overflow-y-auto">
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
  arrivalDepartureDate: z.object({
    from: z
      .date({ required_error: "Please select an arrival date" })
      .optional(),
    to: z
      .date({ required_error: "Please select an departure date" })
      .optional(),
  }),
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
  tipsIncluded: z.boolean().default(false),
  tips: z.number({ required_error: "Please enter tips" }),
  nationality: z.string({ required_error: "Please select a nationality" }),
  language: z.string({ required_error: "Please select a language" }),
  generalNote: z.string().optional(),
  status: z.boolean().default(true),
  internationalFlights: z
    .object({
      flightNumber: z.number(),
      arrivalDepartureDate: z.object({
        from: z
          .date({ required_error: "Please select an arrival date" })
          .optional(),
        to: z
          .date({ required_error: "Please select an departure date" })
          .optional(),
      }),
      destinations: z.string(),
    })
    .optional(),
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
  const [domesticFlights, setDomesticFlights] = useState<DomesticFlight[]>(
    initialValues.domesticFlights ?? [
      {
        id: "v1rlr7m0fb",
        included: true,
        flightNumber: 0,
        arrivalDate: undefined,
        departureDate: undefined,
        destinations: "",
        note: "",
      },
    ],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotels: (initialValues.hotels as string[]) ?? [],
      pax: initialValues.pax ?? undefined,
      internalBookingId: initialValues.internalBookingId ?? undefined,
      arrivalDepartureDate:
        {
          from: initialValues.arrivalDate ?? undefined,
          to: initialValues.departureDate ?? undefined,
        } ?? undefined,
      company: initialValues.company ?? undefined,
      currency: initialValues.currency ?? undefined,
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
      internationalFlights: initialValues.internationalFlights ?? undefined,
      tipsIncluded: initialValues.tipsIncluded ?? undefined,
    },
  });

  const reservations = useMemo(() => {
    let tacker = -1;
    let startDate = form.watch("arrivalDepartureDate.from")!;
    if (!startDate) return [];
    return itineraries.reduce<Reservation[]>((acc, curr) => {
      if (
        acc[tacker]?.city?.name ===
        curr?.cities?.[curr?.cities?.length - 1].name
      ) {
        acc[tacker].end = addDays(startDate, 1);
      } else {
        acc.push({
          start: startDate,
          end: addDays(startDate, 1),
          city: curr?.cities?.[curr?.cities?.length - 1],
          hotels: [],
          meal: undefined,
          price: undefined,
        });
        tacker++;
      }
      startDate = addDays(startDate, 1);
      return [...acc];
    }, []);
  }, [itineraries, form.watch("arrivalDepartureDate.from")]);

  const [reservationsList, setReservationsList] =
    useState<Reservation[]>(reservations);

  useEffect(() => {
    setReservationsList(reservations);
  }, [reservations]);

  const listCitiesHotels = useCallback(async () => {
    try {
      const hotels = await getCitiesHotels(tourCities.map(({ id }) => id));
      setCitiesHotels(hotels);
    } catch (error) {
      console.error(error);
    }
  }, [tourCities]);

  const listTourCountries = useCallback(async () => {
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
  }, [initialValues.tour]);

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
        arrivalDate: values.arrivalDepartureDate.from ?? null,
        company: values.company,
        currency: values.currency,
        departureDate: values.arrivalDepartureDate.to ?? null,
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
        tipsIncluded: values.tipsIncluded,
        tour: values.tour,
        tourists: touristsNames,
        triple: values.tripleRoom ?? 0,
        visa: values.visa,
        countries: tourCountries?.map(({ name }) => `${name}`),
        status: values.status,
        itinerary: itineraries,
        nileCruises: values.nileCruises ?? null,
        internationalFlights: JSON.stringify({
          flightNumber: values.internationalFlights?.flightNumber,
          arrivalDate: values.internationalFlights?.arrivalDepartureDate.from,
          departureDate: values.internationalFlights?.arrivalDepartureDate.to,
          destinations: values.internationalFlights?.destinations,
        }) as InternationalFlight,
        domesticFlights,
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
        <section className="border-b border-gray-200 pb-4">
          <h2 className="pb-2 text-2xl font-semibold text-sky-900">Booking</h2>
          <div className="grid grid-cols-4 gap-x-8 gap-y-8">
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
                                field.onChange(
                                  name === field.value ? "" : name,
                                );
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
              name="arrivalDepartureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel>Arrival ⟹ Departure</FormLabel>
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
                          {field.value?.from && field.value?.to ? (
                            `${format(field.value.from, "PPP")} ⟹ ${format(field.value.to, "PPP")}`
                          ) : (
                            <span>Pick a range</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: field.value?.from,
                          to: field.value?.to,
                        }}
                        onSelect={(value) => {
                          field.onChange({
                            from: value?.from,
                            to: value?.to,
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="tipsIncluded"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <div className="space-y-0.5">
                    <FormLabel>Tips included?</FormLabel>
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
        </section>
        <section className="border-b border-gray-200 pb-4">
          <h2 className="pb-2 text-2xl font-semibold text-sky-900">Tours</h2>
          <div className="grid grid-cols-4 gap-y-2">
            <FormField
              control={form.control}
              name="tour"
              render={({ field }) => (
                <FormItem className="flex items-center gap-x-4">
                  <div className="flex flex-col space-y-2">
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
                                  field.onChange(
                                    name === field.value ? "" : name,
                                  );
                                  setTourOpen(false);
                                  setTourCountries(
                                    name === field.value ? [] : countries ?? [],
                                  );
                                  setTourCities(
                                    name === field.value
                                      ? []
                                      : itinerary?.reduce<SelectCities[]>(
                                          (acc, curr) => [
                                            ...acc,
                                            ...curr.cities,
                                          ],
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
                  </div>
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
                          const itinerary = prev.find(
                            (item) => item.id === id,
                          )!;
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
          </div>
        </section>
        <section className="border-b border-gray-200 pb-4">
          <h2 className="pb-2 text-2xl font-semibold text-sky-900">Hotels</h2>
          <div className="grid grid-cols-4 gap-x-8 gap-y-8">
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
                  <Popover
                    open={nileCruiseOpen}
                    onOpenChange={setNileCruiseOpen}
                  >
                    <PopoverTrigger asChild disabled={!nileCruises.length}>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={nileCruiseOpen}
                        className="w-full justify-between overflow-hidden"
                      >
                        {field.value?.length
                          ? field.value?.map((hotel) =>
                              capitalize(`${hotel}, `),
                            )
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
          </div>
        </section>

        <section className="border-b border-gray-200 py-4">
          <h2 className="text-2xl font-semibold text-sky-900">Flights</h2>
          <h3 className="pb-2 text-xl font-semibold">International Flights</h3>

          <div className="grid grid-cols-4 gap-x-8 gap-y-8">
            <FormField
              control={form.control}
              name="internationalFlights.flightNumber"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel>Number</FormLabel>
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
            <FormField
              control={form.control}
              name="internationalFlights.arrivalDepartureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel>Arrival ⟹ Departure</FormLabel>
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
                          {field.value?.from && field.value?.to ? (
                            `${format(field.value.from, "PPP")} ⟹ ${format(field.value.to, "PPP")}`
                          ) : (
                            <span>Pick a range</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: field.value?.from,
                          to: field.value?.to,
                        }}
                        onSelect={(value) => {
                          field.onChange({
                            from: value?.from,
                            to: value?.to,
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="internationalFlights.destinations"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel>Destinations</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h3 className="pb-2 text-xl font-semibold">Domestic Flights</h3>
          <div className="flex flex-col gap-y-4">
            {domesticFlights.map(
              (
                {
                  id,
                  included,
                  arrivalDate,
                  departureDate,
                  flightNumber,
                  destinations,
                  note,
                },
                i,
              ) => (
                <div key={id} className="flex gap-x-4">
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Internal flights included?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={included}
                        onCheckedChange={(value) =>
                          setDomesticFlights((prev) => {
                            prev[i].included = value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={Math.max(flightNumber ?? 0, 0)}
                        onChange={(e) => {
                          setDomesticFlights((prev) => {
                            prev[i].flightNumber = e.target.valueAsNumber;
                            return [...prev];
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Arrival ⟹ Departure</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !arrivalDate &&
                                !departureDate &&
                                "text-muted-foreground",
                            )}
                          >
                            {arrivalDate && departureDate ? (
                              `${format(arrivalDate, "PPP")} ⟹ ${format(departureDate, "PPP")}`
                            ) : (
                              <span>Pick a range</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: arrivalDate,
                            to: departureDate,
                          }}
                          onSelect={(value) => {
                            setDomesticFlights((prev) => {
                              prev[i].arrivalDate = value?.from;
                              prev[i].departureDate = value?.to;
                              return [...prev];
                            });
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                  <FormItem className="flex grow flex-col justify-start">
                    <FormLabel>Destinations</FormLabel>
                    <FormControl>
                      <Input
                        value={destinations}
                        onChange={(e) => {
                          setDomesticFlights((prev) => {
                            prev[i].destinations = e.target.value;
                            return [...prev];
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem className="flex grow flex-col justify-start">
                    <FormLabel>Internal flight note</FormLabel>
                    <FormControl>
                      <Input
                        value={note}
                        onChange={(e) => {
                          setDomesticFlights((prev) => {
                            prev[i].note = e.target.value;
                            return [...prev];
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <X
                    size={18}
                    className="cursor-pointer self-center text-red-500"
                    onClick={() => {
                      if (domesticFlights.length <= 1) return;
                      setDomesticFlights((prev) =>
                        prev.filter((flight) => flight.id !== id),
                      );
                    }}
                  />
                </div>
              ),
            )}
            <Button
              type="button"
              variant="secondary"
              className="self-start"
              onClick={() =>
                setDomesticFlights((prev) => [
                  ...prev,
                  {
                    id: generateRandomId(),
                    included: true,
                    flightNumber: 0,
                    arrivalDate: undefined,
                    departureDate: undefined,
                    destinations: "",
                    note: "",
                  },
                ])
              }
            >
              Add Flight
            </Button>
          </div>
        </section>

        {!!itineraries.length && !!form.watch("arrivalDepartureDate")?.from && (
          <Reservations
            reservationsList={reservationsList}
            setReservationsList={setReservationsList}
          />
        )}

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

function Reservations({
  reservationsList,
  setReservationsList,
}: {
  reservationsList: Reservation[];
  setReservationsList: (
    cb: (reservationsList: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [editedReservation, setEditedReservation] = useState<
    (Reservation & { index: number })[]
  >([]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Table className="mt-8 rounded border">
        <TableHeader>
          <TableRow>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Hotel</TableHead>
            <TableHead>Meal</TableHead>
            <TableHead>Target Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservationsList.map(
            ({ start, end, city, hotels, meal, price }, index) => (
              <TableRow
                key={generateRandomId()}
                onClick={() => {
                  setEditedReservation([
                    {
                      start,
                      end,
                      city,
                      hotels: [...hotels],
                      meal,
                      price,
                      index,
                    },
                  ]);
                  setIsOpen(true);
                }}
              >
                <TableCell>
                  {!start ? "Start Date" : format(start, "dd/MM/yyy")}
                </TableCell>
                <TableCell>
                  {!end ? "End Date" : format(end, "dd/MM/yyy")}
                </TableCell>
                <TableCell>{city?.name}</TableCell>
                <TableCell>{hotels?.map((name) => `${name}, `)}</TableCell>
                <TableCell>{meal}</TableCell>
                <TableCell>{price}</TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>

      {!!editedReservation?.length && (
        <EditReservationModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          editedReservation={editedReservation}
          setEditedReservation={setEditedReservation}
          setReservationsList={setReservationsList}
        />
      )}
    </>
  );
}

function EditReservationModal({
  isOpen,
  setIsOpen,
  editedReservation,
  setEditedReservation,
  setReservationsList,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  editedReservation: (Reservation & { index: number })[];
  setEditedReservation: (
    cb: (
      reservations: (Reservation & { index: number })[],
    ) => (Reservation & { index: number })[],
  ) => void;
  setReservationsList: (
    cb: (reservations: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [cityHotels, setCityHotels] = useState<SelectHotels[]>([]);
  const listCityHotels = useCallback(async () => {
    try {
      const hotels = await getCityHotels({
        countryId: editedReservation[0].city?.countryId!,
        cityId: editedReservation[0].city?.id!,
      });
      setCityHotels(hotels);
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listCityHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) {
          setCityHotels([]);
          setEditedReservation(() => []);
        }
      }}
    >
      <DialogContent className="max-h-screen min-w-[1280px] gap-y-2 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {editedReservation[0].city?.name} Reservation
          </DialogTitle>
        </DialogHeader>
        <Table className="mt-4 rounded border">
          <TableHeader>
            <TableRow>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Meal</TableHead>
              <TableHead>Target Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedReservation.map((reservation, i) => (
              <ReservationTableRow
                key={generateRandomId()}
                {...reservation}
                index={i}
                listLength={editedReservation.length}
                cityHotels={cityHotels}
                editedReservation={editedReservation}
                setEditedReservation={setEditedReservation}
              />
            ))}
          </TableBody>
        </Table>
        <DialogFooter className="flex w-full justify-between pt-4">
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => {
              setEditedReservation((prev) =>
                prev
                  ? [
                      ...prev,
                      {
                        start: undefined,
                        end: prev[prev.length - 1].end,
                        hotels: [],
                        meal: undefined,
                        price: undefined,
                        index: prev[prev.length - 1].index + 1,
                        city: prev[0].city,
                      },
                    ]
                  : [],
              );
            }}
          >
            Add
          </Button>
          <div className="flex gap-x-2">
            <Button type="button" variant={"outline"}>
              Cancel
            </Button>
            <Button
              className="flex gap-x-1"
              onClick={() => {
                setReservationsList((prev) => {
                  const firstPart = prev.slice(0, editedReservation[0].index);
                  const lastPart = prev.slice(editedReservation[0].index + 1);
                  const newList = [
                    ...firstPart,
                    ...editedReservation,
                    ...lastPart,
                  ];
                  return newList;
                });
                setCityHotels([]);
                setEditedReservation(() => []);
                setIsOpen(false);
              }}
            >
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReservationTableRow({
  start,
  end,
  hotels,
  meal,
  price,
  cityHotels,
  index,
  listLength,
  editedReservation,
  setEditedReservation,
}: Reservation & {
  cityHotels: SelectCities[];
  index: number;
  listLength: number;
  editedReservation: (Reservation & { index: number })[];
  setEditedReservation: (
    cb: (
      reservations: (Reservation & { index: number })[],
    ) => (Reservation & { index: number })[],
  ) => void;
}) {
  const [hotelsOpen, setHotelsOpen] = useState(false);
  // const [selectedHotels, setSelectedHotels] = useState<string[]>(hotels ?? []);
  const [endAt, setEndAt] = useState<Date | undefined>(end);
  const { initStart, initEnd } = { initStart: start, initEnd: end };
  return (
    <TableRow>
      <TableCell>
        {start ? format(start, "dd/MM/yyyy") : "Previous end date ↗"}
      </TableCell>
      <TableCell>
        {index === listLength - 1 ? (
          end ? (
            format(end, "dd/MM/yyyy")
          ) : (
            "End date"
          )
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !endAt && "text-muted-foreground",
                  )}
                >
                  {endAt ? format(endAt, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                disabled={(date) => {
                  if (!initStart || !initEnd) return false;
                  return date < initStart || date >= initEnd;
                }}
                selected={endAt}
                onSelect={(date) => {
                  setEndAt(date);
                  setEditedReservation((prev) => {
                    prev[index + 1].start = date;
                    prev[index].end = date;
                    return [...prev];
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      </TableCell>
      <TableCell>
        <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
          <PopoverTrigger asChild disabled={!cityHotels.length}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={hotelsOpen}
              className="w-full justify-between overflow-hidden"
            >
              {editedReservation[index].hotels.length
                ? editedReservation[index].hotels.map((hotel) =>
                    capitalize(`${hotel}, `),
                  )
                : "Select a hotel"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className=" p-0">
            <Command>
              <CommandInput placeholder="Search hotel..." />
              <CommandEmpty>No hotels found.</CommandEmpty>
              <CommandGroup>
                {cityHotels.map(({ id, name }) => (
                  <CommandItem key={id} className="flex items-center gap-x-2">
                    <Checkbox
                      checked={editedReservation[index].hotels.includes(
                        name ?? "",
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditedReservation(() => {
                            if (
                              !editedReservation[index].hotels.includes(name!)
                            )
                              editedReservation[index].hotels.push(name!);
                            return [...editedReservation];
                          });
                        } else {
                          setEditedReservation(() => {
                            editedReservation[index].hotels = editedReservation[
                              index
                            ].hotels.filter((hotel) => hotel !== name);
                            return [...editedReservation];
                          });
                        }
                        setHotelsOpen(false);
                      }}
                    />
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Input
          placeholder="Meal..."
          defaultValue={meal}
          onBlur={(e) =>
            setEditedReservation((prev) => {
              prev[index].meal = e.target.value;
              return [...prev];
            })
          }
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price}
          placeholder="Price..."
          type="number"
          onBlur={(e) => {
            setEditedReservation(() => {
              editedReservation[index].price = e.target.valueAsNumber;
              return [...editedReservation];
            });
          }}
        />
      </TableCell>
    </TableRow>
  );
}
