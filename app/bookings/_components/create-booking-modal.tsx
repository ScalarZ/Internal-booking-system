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
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, formatDate } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  SelectCities,
  SelectCompanies,
  SelectCountries,
  SelectHotels,
  SelectNationalities,
  SelectNileCruises,
  SelectReservations,
  SelectTours,
} from "@/drizzle/schema";
import capitalize from "@/utils/capitalize";
import { addBookings } from "@/utils/db-queries/booking";
import { Reorder } from "framer-motion";
import EditItineraryModal from "@/app/create/tours/_components/edit-itinerary-modal";
import { getCitiesHotels } from "@/utils/db-queries/hotel";
import AddItineraryModal from "./create-itinerary-modal";

import { generateRandomId } from "@/utils/generate-random-id";
import Reservations from "./reservations";
import { DialogDescription } from "@radix-ui/react-dialog";
import { createClient } from "@/utils/supabase/client";
import UploadImage from "./upload-image";

type Reservation = Omit<
  SelectReservations,
  "id" | "createdAt" | "updatedAt" | "bookingId" | "finalPrice"
>;

export default function CreateBookingModal({
  nileCruises,
  companies,
  tours,
  nationalities,
}: {
  nileCruises: SelectNileCruises[];
  companies: SelectCompanies[];
  nationalities: SelectNationalities[];
  tours: SelectTours[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="mb-4 flex w-full justify-end">
        <Button onClick={() => setIsOpen(true)}>Add</Button>
      </div>
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-4 overflow-y-auto">
        <DialogHeader className="capitalize">
          <DialogTitle>Add New Booking</DialogTitle>
        </DialogHeader>
        <From
          nileCruises={nileCruises}
          companies={companies}
          tours={tours}
          nationalities={nationalities}
          closeModal={() => setIsOpen(false)}
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
      flightNumber: z.number().optional(),
      arrivalDepartureDate: z
        .object({
          from: z
            .date({ required_error: "Please select an arrival date" })
            .optional(),
          to: z
            .date({ required_error: "Please select an departure date" })
            .optional(),
        })
        .optional(),
      destinations: z.string().optional(),
      file: z.string().optional(),
    })
    .optional(),
});

function From({
  companies,
  tours,
  nationalities,
  nileCruises,
  closeModal,
}: {
  companies: SelectCompanies[];
  tours: SelectTours[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  closeModal: () => void;
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
  const [touristsNames, setTouristsNames] = useState<string[]>([]);
  const [tourCountries, setTourCountries] = useState<SelectCountries[]>([]);
  const [tourCities, setTourCities] = useState<SelectCities[]>([]);
  const [passports, setPassports] = useState<Passport[]>([]);
  const [citiesHotels, setCitiesHotels] = useState<SelectHotels[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [itineraryInitialValues, setItineraryInitialValues] =
    useState<Itinerary | null>(null);
  const [domesticFlights, setDomesticFlights] = useState<
    ArrivalDeparturePair<DomesticFlight>[]
  >([
    {
      id: "v1rlr7m0fb",
      arrival: {
        arrivalDate: undefined,
        arrivalTime: undefined,
        flightNumber: undefined,
        from: undefined,
        to: undefined,
        issued: false,
        included: true,
      },
      departure: {
        departureDate: undefined,
        departureTime: undefined,
        flightNumber: undefined,
        from: undefined,
        to: undefined,
        issued: false,
        included: true,
      },
      files: [],
      urls: [],
    },
  ]);
  const [internationalFlights, setInternationalFlights] = useState<
    ArrivalDeparturePair<InternationalFlight>[]
  >([
    {
      id: "v1rlr7m0fa",
      arrival: {
        arrivalDate: undefined,
        arrivalTime: undefined,
        destinations: undefined,
        flightNumber: undefined,
        referenceTicket: undefined,
      },
      departure: {
        departureDate: undefined,
        departureTime: undefined,
        destinations: undefined,
        flightNumber: undefined,
        referenceTicket: undefined,
      },
      files: [],
      urls: [],
    },
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotels: [],
      nileCruises: [],
      status: true,
    },
  });
  const [isAlterModalOpen, setIsAlertModalOpen] = useState(false);
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);

  function generateReservations() {
    let tacker = -1;
    let startDate = form.watch("arrivalDepartureDate.from")!;
    if (!startDate || !itineraries?.length) return;
    const reservations = itineraries.reduce<Reservation[]>((acc, curr) => {
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
          meal: null,
          targetPrice: null,
          currency: "USD",
        });
        tacker++;
      }
      startDate = addDays(startDate, 1);
      return [...acc];
    }, []);
    setReservationsList(reservations);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const date = Date.now();
      const res1 = await Promise.all(
        passports.map(({ image }) =>
          image.file
            ? supabase.storage
                .from("tourists passport")
                .upload(
                  `${internalBookingId}/passports/${image.file?.name}-${date}`,
                  image.file,
                )
            : undefined,
        ),
      );
      const res2 = await Promise.all(
        domesticFlights
          .map(({ files }) =>
            files
              ? files.map(({ image }) =>
                  supabase.storage
                    .from("flight tickets")
                    .upload(
                      `${internalBookingId}/${image.file?.name}-${date}`,
                      image.file,
                    ),
                )
              : [],
          )
          .flat(),
      );
      const res3 = await Promise.all(
        internationalFlights
          .map(({ files }) =>
            files
              ? files.map(({ image }) =>
                  supabase.storage
                    .from("international flights tickets")
                    .upload(
                      `${internalBookingId}/${image.file?.name}-${date}`,
                      image.file,
                    ),
                )
              : [],
          )
          .flat(),
      );
      const paths = res1
        .map((res) => res?.data?.path)
        .filter((path) => path !== undefined)
        .map((path, i) => ({
          url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/tourists%20passport/${path}`,
          name: `${passports[i].image.file?.name}-${date}`,
        }));

      let index = 0;
      const domesticFlightsTickets: Ticket[][] = [];
      for (const row of domesticFlights) {
        const rowLength = row.files?.length ?? 0;
        domesticFlightsTickets.push(
          res2.slice(index, index + rowLength).map(({ data }, i) => ({
            url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/flight%20tickets/${data?.path}`,
            name: row.files?.[i]?.name,
          })),
        );
        index += rowLength;
      }
      index = 0;
      const internationalFlightsTickets: Ticket[][] = [];
      for (const row of internationalFlights) {
        const rowLength = row.files?.length ?? 0;
        internationalFlightsTickets.push(
          res3.slice(index, index + rowLength).map(({ data }, i) => ({
            url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/international%20flights%20tickets/${data?.path}`,
            name: row.files?.[i]?.name,
          })),
        );
        index += rowLength;
      }
      console.log(res3, internationalFlightsTickets, internationalFlights);
      await addBookings(
        {
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
          domesticFlights: domesticFlights.map(({ files, ...props }) => props),
          internationalFlights: internationalFlights.map(
            ({ files, ...props }) => props,
          ),
          passports: [],
        },
        reservationsList?.map(
          ({ start, end, meal, city, targetPrice, hotels, currency }) => ({
            start,
            end,
            meal,
            city,
            targetPrice,
            currency,
            hotels,
          }),
        ),
        paths,
        domesticFlightsTickets,
        internationalFlightsTickets,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      form.reset();
      closeModal();
    }
  }

  async function listCitiesHotels(tourCities: SelectCities[]) {
    try {
      const hotels = await getCitiesHotels(tourCities?.map(({ id }) => id));
      setCitiesHotels(hotels);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section>
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
                        type="button"
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
                          {companies?.map(({ id, name, companyId }) => (
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
                      {["USD", "EUR", "EGP"]?.map((currency) => (
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
                      {nationalities?.map(({ name, id }) => (
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
                      ]?.map((language) => (
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
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          type="button"
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
                    touristsNames?.length >= form.watch("pax")
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    !name ||
                    !form.watch("pax") ||
                    touristsNames?.length >= form.watch("pax")
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
                This fields depends on the PAX number
                <span>
                  {touristsNames?.length}/
                  {!isNaN(form.watch("pax")) ? form.watch("pax") : 0}
                </span>
              </FormDescription>
              <div>
                <ul className="flex flex-wrap gap-2 p-2 text-white">
                  {touristsNames?.map((name, i) => (
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
            <UploadImage
              title="Upload Tourists Passports"
              images={passports}
              setImages={setPassports}
              maxNumber={form.watch("pax")}
              button={
                <Button
                  type="button"
                  variant="secondary"
                  className="mb-8 self-center"
                >
                  Upload Passports
                </Button>
              }
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
                          {field.value ? field.value : "Select a tour"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=" p-0">
                        <Command>
                          <CommandInput placeholder="Search tour..." />
                          <CommandEmpty>No tour found.</CommandEmpty>
                          <CommandGroup>
                            {tours?.map(
                              ({ id, name, countries, itinerary }) => (
                                <CommandItem
                                  key={id}
                                  value={name ?? ""}
                                  onSelect={async () => {
                                    field.onChange(
                                      name === field.value ? "" : name,
                                    );
                                    setTourOpen(false);
                                    setTourCountries(
                                      name === field.value
                                        ? []
                                        : countries ?? [],
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
                                      name === field.value
                                        ? []
                                        : itinerary ?? [],
                                    );
                                    if (name !== field.value)
                                      await listCitiesHotels(
                                        itinerary?.reduce<SelectCities[]>(
                                          (acc, curr) => [
                                            ...acc,
                                            ...curr.cities,
                                          ],
                                          [],
                                        ) ?? [],
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
                              ),
                            )}
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
            {!!itineraries?.length && (
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
                  values={itineraries?.map(({ id }) => id)}
                  onReorder={(newOrd) =>
                    setItineraries((prev) =>
                      (
                        newOrd?.map((id) => {
                          const itinerary = prev.find(
                            (item) => item.id === id,
                          )!;
                          return itinerary;
                        }) as Itinerary[]
                      )?.map((itinerary, i) => ({
                        ...itinerary,
                        day: `Day ${i + 1}`,
                      })),
                    )
                  }
                  layoutScroll
                  className="flex w-full flex-nowrap overflow-x-auto border"
                >
                  {itineraries?.map(({ id, day, activities, cities }, i) => (
                    <Reorder.Item
                      key={id}
                      value={id}
                      className="flex max-w-min cursor-grab items-start justify-between border-l border-neutral-200 bg-white p-2 first:border-none"
                    >
                      <div className="flex flex-col gap-y-1">
                        <span className="font-medium">{day}</span>
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
                                ?.map((itinerary, i) => ({
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
        <section>
          <h2 className="pb-2 text-2xl font-semibold text-sky-900">Hotels</h2>
          <div className="grid grid-cols-4 gap-x-8 gap-y-8">
            <FormField
              control={form.control}
              name="hotels"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel className="block">Hotels</FormLabel>
                  <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
                    <PopoverTrigger asChild disabled={!citiesHotels?.length}>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={hotelsOpen}
                        className="w-full justify-between overflow-hidden"
                      >
                        {field.value?.length
                          ? field.value?.map((hotel) =>
                              capitalize(`${hotel}, `),
                            )
                          : "Select hotels"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className=" p-0">
                      <Command>
                        <CommandInput placeholder="Search hotel..." />
                        <CommandEmpty>No hotel found.</CommandEmpty>
                        <CommandGroup>
                          {citiesHotels?.map(({ id, name }) => (
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
                    <PopoverTrigger asChild disabled={!nileCruises?.length}>
                      <Button
                        type="button"
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
                          {nileCruises?.map(({ id, name }) => (
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

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-sky-900">Flights</h2>
          <h3 className="pb-2 text-xl font-semibold">International Flights</h3>

          <div className="flex flex-col gap-y-4">
            {internationalFlights?.map((flight, i) => (
              <div key={flight.id} className="flex gap-x-4">
                <div className="flex flex-grow flex-col gap-y-4">
                  <div className="flex gap-x-4">
                    <FormItem className=" flex flex-col justify-start">
                      <FormLabel>Arrival Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-[160px] pl-3 text-left font-normal",
                                !flight.arrival.arrivalDate &&
                                  "text-muted-foreground",
                              )}
                            >
                              {flight.arrival.arrivalDate ? (
                                `${format(flight.arrival.arrivalDate, "PPP")}`
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
                            selected={flight.arrival.arrivalDate}
                            onSelect={(value) => {
                              setInternationalFlights((prev) => {
                                prev[i].arrival.arrivalDate = value;
                                return [...prev];
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                    <FormItem className="relative flex flex-col justify-start">
                      <FormLabel>Arrival Time</FormLabel>
                      <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                        {internationalFlights[i].arrival.arrivalTime
                          ? format(
                              internationalFlights[i].arrival.arrivalTime!,
                              "HH:mm",
                            )
                          : "--:--"}
                      </div>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setInternationalFlights((prev) => {
                            prev[i].arrival.arrivalTime =
                              e.target.valueAsDate ?? undefined;
                            return [...prev];
                          })
                        }
                      />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Number</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setInternationalFlights((prev) => {
                              prev[i].arrival.flightNumber = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setInternationalFlights((prev) => {
                              prev[i].arrival.destinations = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Reference ticket</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setInternationalFlights((prev) => {
                              prev[i].arrival.referenceTicket = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                  <div className="flex gap-x-4">
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Departure Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-[160px] pl-3 text-left font-normal",
                                !flight.departure.departureDate &&
                                  "text-muted-foreground",
                              )}
                            >
                              {flight.departure.departureDate ? (
                                `${format(flight.departure.departureDate, "PPP")}`
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
                            selected={flight.departure.departureDate}
                            onSelect={(value) => {
                              setInternationalFlights((prev) => {
                                prev[i].departure.departureDate = value;
                                return [...prev];
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                    <FormItem className="relative flex flex-col justify-start">
                      <FormLabel>Departure Time</FormLabel>
                      <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                        {internationalFlights[i].departure.departureTime
                          ? format(
                              internationalFlights[i].departure.departureTime!,
                              "HH:mm",
                            )
                          : "--:--"}
                      </div>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setInternationalFlights((prev) => {
                            prev[i].departure.departureTime =
                              e.target.valueAsDate ?? undefined;
                            return [...prev];
                          })
                        }
                      />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Number</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setInternationalFlights((prev) => {
                              prev[i].departure.flightNumber = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setInternationalFlights((prev) => {
                              prev[i].departure.destinations = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className=" flex flex-grow flex-col justify-start">
                      <FormLabel>Reference ticket</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setInternationalFlights((prev) => {
                              prev[i].departure.referenceTicket =
                                e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>
                <FormItem className="group relative flex flex-col justify-start">
                  <FormLabel
                    htmlFor={flight.id}
                    className="flex flex-col gap-y-2"
                  >
                    Ticket
                    <UploadImage
                      title="Upload International Flights Ticket"
                      images={flight.files ?? []}
                      setImages={(images) => {
                        setInternationalFlights((prev) => {
                          prev[i].files = images;
                          return [...prev];
                        });
                      }}
                      button={
                        <div
                          className={cn(
                            "flex h-10 cursor-pointer items-center justify-center rounded border hover:bg-sky-100",
                            {
                              "bg-sky-100": flight.files?.length,
                            },
                          )}
                        >
                          <Upload strokeWidth={2} size={18} />
                        </div>
                      }
                    />
                  </FormLabel>
                </FormItem>

                <X
                  size={18}
                  className={cn("mt-8 cursor-pointer text-red-500", {
                    hidden: internationalFlights?.length < 2,
                  })}
                  onClick={() => {
                    if (internationalFlights?.length <= 1) return;
                    setInternationalFlights((prev) =>
                      prev.filter((f) => f.id !== flight.id),
                    );
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="mt-4 self-start"
              onClick={() =>
                setInternationalFlights((prev) => [
                  ...prev,
                  {
                    id: generateRandomId(),
                    arrival: {
                      arrivalDate: undefined,
                      arrivalTime: undefined,
                      destinations: undefined,
                      flightNumber: undefined,
                      referenceTicket: undefined,
                    },
                    departure: {
                      departureDate: undefined,
                      departureTime: undefined,
                      destinations: undefined,
                      flightNumber: undefined,
                      referenceTicket: undefined,
                    },
                    files: [],
                    urls: [],
                  },
                ])
              }
            >
              Add Flight
            </Button>
          </div>

          <h3 className="pb-2 text-xl font-semibold">Domestic Flights</h3>
          <div className="flex flex-col gap-y-4">
            {domesticFlights?.map((flight, i) => (
              <div key={flight.id} className="flex gap-x-4">
                <div className="flex flex-grow flex-col gap-y-4">
                  <div className="flex gap-x-4">
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Included</FormLabel>
                      <FormControl>
                        <Switch
                          checked={flight.arrival.included}
                          onCheckedChange={(value) =>
                            setDomesticFlights((prev) => {
                              prev[i].arrival.included = value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Arrival Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-[160px] pl-3 text-left font-normal",
                                !flight.arrival.arrivalDate &&
                                  "text-muted-foreground",
                              )}
                            >
                              {flight.arrival.arrivalDate ? (
                                `${format(flight.arrival.arrivalDate, "PPP")}`
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
                            selected={flight.arrival.arrivalDate}
                            onSelect={(value) => {
                              setDomesticFlights((prev) => {
                                prev[i].arrival.arrivalDate = value;
                                return [...prev];
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                    <FormItem className="relative flex flex-col justify-start">
                      <FormLabel>Arrival Time</FormLabel>
                      <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                        {domesticFlights[i].arrival.arrivalTime
                          ? format(
                              domesticFlights[i].arrival.arrivalTime!,
                              "HH:mm",
                            )
                          : "--:--"}
                      </div>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setDomesticFlights((prev) => {
                            prev[i].arrival.arrivalTime =
                              e.target.valueAsDate ?? undefined;
                            return [...prev];
                          })
                        }
                      />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Number</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setDomesticFlights((prev) => {
                              prev[i].arrival.flightNumber = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setDomesticFlights((prev) => {
                              prev[i].arrival.from = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setDomesticFlights((prev) => {
                              prev[i].arrival.to = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Issued</FormLabel>
                      <FormControl>
                        <Switch
                          checked={flight.arrival.issued}
                          onCheckedChange={(value) =>
                            setDomesticFlights((prev) => {
                              prev[i].arrival.issued = value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                  <div className="flex gap-x-4">
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Included</FormLabel>
                      <FormControl>
                        <Switch
                          checked={flight.departure.included}
                          onCheckedChange={(value) =>
                            setDomesticFlights((prev) => {
                              prev[i].departure.included = value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Departure Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-[160px] pl-3 text-left font-normal",
                                !flight.departure.departureDate &&
                                  "text-muted-foreground",
                              )}
                            >
                              {flight.departure.departureDate ? (
                                `${format(flight.departure.departureDate, "PPP")}`
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
                            selected={flight.departure.departureDate}
                            onSelect={(value) => {
                              setDomesticFlights((prev) => {
                                prev[i].departure.departureDate = value;
                                return [...prev];
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                    <FormItem className="relative flex flex-col justify-start">
                      <FormLabel>Arrival Time</FormLabel>
                      <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                        {domesticFlights[i].departure.departureTime
                          ? format(
                              domesticFlights[i].departure.departureTime!,
                              "HH:mm",
                            )
                          : "--:--"}
                      </div>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setDomesticFlights((prev) => {
                            prev[i].departure.departureTime =
                              e.target.valueAsDate ?? undefined;
                            return [...prev];
                          })
                        }
                      />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>Number</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setDomesticFlights((prev) => {
                              prev[i].departure.flightNumber = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setDomesticFlights((prev) => {
                              prev[i].departure.from = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-grow flex-col justify-start">
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) =>
                            setDomesticFlights((prev) => {
                              prev[i].departure.to = e.target.value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel>Issued</FormLabel>
                      <FormControl>
                        <Switch
                          checked={flight.departure.issued}
                          onCheckedChange={(value) =>
                            setDomesticFlights((prev) => {
                              prev[i].departure.issued = value;
                              return [...prev];
                            })
                          }
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
                <FormItem className="group relative flex flex-col justify-start">
                  <FormLabel
                    htmlFor={flight.id}
                    className="flex flex-col gap-y-2"
                  >
                    Ticket
                    <UploadImage
                      title="Upload Domestic Flights Ticket"
                      images={flight.files ?? []}
                      setImages={(images) => {
                        setDomesticFlights((prev) => {
                          prev[i].files = images;
                          return [...prev];
                        });
                      }}
                      button={
                        <div
                          className={cn(
                            "flex h-10 cursor-pointer items-center justify-center rounded border hover:bg-sky-100",
                            {
                              "bg-sky-100": flight.files?.length,
                            },
                          )}
                        >
                          <Upload strokeWidth={2} size={18} />
                        </div>
                      }
                    />
                  </FormLabel>
                </FormItem>

                <X
                  size={18}
                  className={cn("mt-8 cursor-pointer text-red-500", {
                    hidden: internationalFlights?.length < 2,
                  })}
                  onClick={() => {
                    if (internationalFlights?.length <= 1) return;
                    setDomesticFlights((prev) =>
                      prev.filter((f) => f.id !== flight.id),
                    );
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="self-start"
              onClick={() =>
                setDomesticFlights((prev) => [
                  ...prev,
                  {
                    id: generateRandomId(),
                    arrival: {
                      arrivalDate: undefined,
                      arrivalTime: undefined,
                      flightNumber: undefined,
                      from: undefined,
                      to: undefined,
                      issued: false,
                      included: true,
                    },
                    departure: {
                      departureDate: undefined,
                      departureTime: undefined,
                      flightNumber: undefined,
                      from: undefined,
                      to: undefined,
                      issued: false,
                      included: true,
                    },
                    files: [],
                    urls: [],
                  },
                ])
              }
            >
              Add Flight
            </Button>
          </div>
        </section>

        <section>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold text-sky-900">Hotels</h2>
            <Button
              variant="secondary"
              disabled={
                !itineraries?.length || !form.watch("arrivalDepartureDate.from")
              }
              onClick={
                !reservationsList?.length
                  ? generateReservations
                  : () => setIsAlertModalOpen(true)
              }
              type="button"
            >
              Generate reservations
            </Button>
          </div>
          {!!reservationsList?.length &&
            !!form.watch("arrivalDepartureDate")?.from && (
              <Reservations
                reservationsList={reservationsList}
                setReservationsList={setReservationsList}
                tourCountries={tourCountries}
              />
            )}
        </section>

        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"} onClick={closeModal}>
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
      {!!itineraries?.length && (
        <AddItineraryModal
          day={`Day ${itineraries?.length + 1}`}
          isOpen={addItineraryModalOpen}
          setIsOpen={setAddItineraryModalOpen}
          selectedCountries={tourCountries}
          setItineraries={setItineraries}
        />
      )}
      {isAlterModalOpen && (
        <AlterModal
          isOpen={isAlterModalOpen}
          setIsOpen={setIsAlertModalOpen}
          generateReservations={generateReservations}
        />
      )}
    </Form>
  );
}

function AlterModal({
  isOpen,
  setIsOpen,
  generateReservations,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  generateReservations: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-screen gap-y-2 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Reservations</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="text-gray-500">
            This will regenerate the reservations table and all the adjustments
            you have made will be removed
          </p>
        </DialogDescription>
        <DialogFooter className="flex w-full justify-between pt-4">
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => {
              generateReservations();
              setIsOpen(false);
            }}
          >
            Generate
          </Button>
          <div className="flex gap-x-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
