"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  File,
  ImageIcon,
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
import React, { useCallback, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, formatDate } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  SelectBookingWithReservations,
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
import { getCountryCities } from "@/utils/db-queries/city";
import { createClient } from "@/utils/supabase/client";
import ImageUploading, {
  ImageListType,
  ImageType,
} from "react-images-uploading";
import { updateBooking } from "@/utils/db-queries/booking";

type Reservation = Omit<SelectReservations, "id" | "createdAt" | "updatedAt">;

export default function EditBookingModal({
  companies,
  tours,
  nileCruises,
  nationalities,
  initialValues,
  isOpen,
  type,
  setIsOpen,
  setInitialValues,
}: {
  companies: SelectCompanies[];
  tours: SelectTours[];
  nileCruises: SelectNileCruises[];
  nationalities: SelectNationalities[];
  isOpen: boolean;
  type?: "booking" | "reservation" | "aviation";
  initialValues: SelectBookingWithReservations;
  setIsOpen: (value: boolean) => void;
  setInitialValues: (value: SelectBookingWithReservations | null) => void;
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
          type={type}
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
  tour: z.string({ required_error: "Please select a tour" }).optional(),
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
  type,
  setInitialValues,
  closeModal,
}: {
  companies: SelectCompanies[];
  tours: SelectTours[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  initialValues: SelectBookingWithReservations;
  type?: "booking" | "reservation" | "aviation";
  closeModal: () => void;
  setInitialValues: (value: SelectBookingWithReservations | null) => void;
}) {
  const [name, setName] = useState("");
  const [internalBookingId, setInternalBookingId] = useState(
    initialValues.internalBookingId,
  );
  const [tourOpen, setTourOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [nileCruiseOpen, setNileCruiseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditItineraryModalOpen, setIsEditItineraryModalOpen] =
    useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<{
    index: number;
    state: boolean;
    url: string | undefined;
    type: "domestic" | "international";
  }>({
    index: -1,
    state: false,
    url: undefined,
    type: "domestic",
  });
  const [passports, setPassports] = useState<Passport[]>(
    initialValues.passports ?? [],
  );
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
  const [domesticFlights, setDomesticFlights] = useState<
    (ArrivalDeparturePair<DomesticFlight> & { src?: string })[]
  >(
    initialValues.domesticFlights ?? [
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
        src: undefined,
      },
    ],
  );
  const [internationalFlights, setInternationalFlights] = useState<
    (ArrivalDeparturePair<InternationalFlight> & { src?: string })[]
  >(
    initialValues.internationalFlights ?? [
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
      tipsIncluded: initialValues.tipsIncluded ?? undefined,
    },
  });
  const [reservationsList, setReservationsList] = useState<Reservation[]>(
    initialValues.reservations?.map(({ city, ...props }) => ({
      ...props,
      city: typeof city === "string" ? JSON.parse(city) : city,
    })),
  );
  const [isAlterModalOpen, setIsAlertModalOpen] = useState(false);

  const listCitiesHotels = useCallback(async () => {
    try {
      const hotels = await getCitiesHotels(tourCities?.map(({ id }) => id));
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
    if (!tourCities?.length) return;
    listCitiesHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourCities]);

  useEffect(() => {
    listTourCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          bookingId: initialValues.id,
          finalPrice: null,
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

      const res = await Promise.all(
        passports.map(({ image }) =>
          image?.file
            ? supabase.storage
                .from("tourists passport")
                .upload(
                  `${internalBookingId}/${image?.file?.name}-${Date.now()}`,
                  image.file,
                )
            : undefined,
        ),
      );

      const paths = res.map((res, i) =>
        res
          ? {
              url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/tourists%20passport/${res.data?.path}`,
              name: `${passports[i]?.image?.file?.name}-${Date.now()}`,
            }
          : {
              url: passports[i]?.url,
              name: passports[i]?.name,
            },
      );
      // Domestic Flights
      const updatedDomesticTickets = domesticFlights
        .map(({ urls }) => urls)
        .flat();

      const res2 = await Promise.all(
        updatedDomesticTickets.map((file) =>
          file.image
            ? supabase.storage
                .from("flight tickets")
                .upload(
                  `${internalBookingId}/${file.image?.name}-${Date.now()}`,
                  file.image,
                )
            : undefined,
        ),
      );
      const domesticFlightsTickets: Ticket[][] = [];
      let index = 0;
      for (const row of domesticFlights) {
        const rowLength = row.urls?.length ?? 0;
        domesticFlightsTickets.push(
          res2.slice(index, index + rowLength).map((res, i) =>
            res
              ? {
                  url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/flight%20tickets/${res.data?.path}`,
                  name: row.urls?.[i]?.name,
                }
              : row.urls[i],
          ),
        );
        index += rowLength;
      }

      // International Flights

      const updatedInternationalTickets = internationalFlights
        .map(({ urls }) => urls)
        .flat();

      const res3 = await Promise.all(
        updatedInternationalTickets.map((file) =>
          file.image
            ? supabase.storage
                .from("flight tickets")
                .upload(
                  `${internalBookingId}/${file.image?.name}-${Date.now()}`,
                  file.image,
                )
            : undefined,
        ),
      );
      console.log(res3, internationalFlights, res2, domesticFlights);
      const internationalFlightTickets: Ticket[][] = [];

      index = 0;
      for (const row of internationalFlights) {
        const rowLength = row.urls?.length ?? 0;
        internationalFlightTickets.push(
          res3.slice(index, index + rowLength).map((res, i) =>
            res
              ? {
                  url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/international%20flights%20tickets/${res.data?.path}`,
                  name: row.urls?.[i]?.name,
                }
              : row.urls[i],
          ),
        );
        index += rowLength;
      }
      console.log(internationalFlightTickets, domesticFlightsTickets);
      await updateBooking(
        {
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
          tour: values.tour ?? initialValues.tour,
          tourists: touristsNames,
          triple: values.tripleRoom ?? 0,
          visa: values.visa,
          countries: tourCountries?.map(({ name }) => `${name}`),
          status: values.status,
          itinerary: itineraries,
          nileCruises: values.nileCruises ?? null,
          //@ts-ignore
          domesticFlights: domesticFlights.map(({ urls }) =>
            urls.map(({ image, ...props }) => props),
          ),
          //@ts-ignore
          internationalFlights: internationalFlights.map(({ urls }) =>
            urls.map(({ image, ...props }) => props),
          ),
        },
        reservationsList?.map(
          ({
            start,
            end,
            meal,
            city,
            targetPrice,
            hotels,
            currency,
            bookingId,
            finalPrice,
          }) => ({
            start,
            end,
            meal,
            city,
            targetPrice,
            currency,
            hotels,
            bookingId,
            finalPrice,
          }),
        ),
        paths,
        domesticFlightsTickets,
        internationalFlightTickets,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      form.reset();
      closeModal();
      setInitialValues(null);
    }
  }
  console.log(domesticFlights);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div
          className={cn("space-y-8", {
            "pointer-events-none opacity-70": type === "reservation",
          })}
        >
          <section
            className={cn("space-y-8", {
              "pointer-events-none opacity-70": type === "aviation",
            })}
          >
            <h2 className="pb-2 text-2xl font-semibold text-sky-900">
              Booking
            </h2>
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
                  <div>This fields depends on the PAX number</div>
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
          <section
            className={cn("space-y-8", {
              "pointer-events-none opacity-70": type === "aviation",
            })}
          >
            <h2 className="pb-2 text-2xl font-semibold text-sky-900">Tours</h2>
            <div className="grid grid-cols-4 gap-y-2">
              <FormField
                control={form.control}
                name="tour"
                disabled
                render={({ field }) => (
                  <FormItem className="items-center gap-x-4">
                    <div className="flex flex-col space-y-2">
                      <FormLabel className="block">Tour</FormLabel>
                      <Popover open={tourOpen} onOpenChange={setTourOpen}>
                        <PopoverTrigger asChild disabled>
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
                              {tours?.map(
                                ({ id, name, countries, itinerary }) => (
                                  <CommandItem
                                    key={id}
                                    value={name ?? ""}
                                    onSelect={() => {
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
                    {type !== "reservation" && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setAddItineraryModalOpen(true)}
                        className="flex h-8 gap-x-1"
                      >
                        <Plus size={16} />
                        Add itinerary
                      </Button>
                    )}
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
          <section
            className={cn("space-y-8", {
              "pointer-events-none opacity-70": type === "aviation",
            })}
          >
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
            <h3 className="pb-2 text-xl font-semibold">
              International Flights
            </h3>
            <div className="flex flex-col gap-y-4">
              {internationalFlights?.map((flight, i) => (
                <div key={flight.id} className="flex gap-x-4">
                  <div className="flex flex-grow flex-col gap-y-4">
                    <div className="flex gap-x-4">
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
                                  !flight.arrival?.arrivalDate &&
                                    "text-muted-foreground",
                                )}
                              >
                                {flight.arrival?.arrivalDate ? (
                                  `${format(flight.arrival?.arrivalDate, "PPP")}`
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
                              selected={flight.arrival?.arrivalDate}
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
                          {internationalFlights[i].arrival?.arrivalTime
                            ? format(
                                internationalFlights[i].arrival.arrivalTime!,
                                "HH:mm",
                              )
                            : "--:--"}
                        </div>
                        <Input
                          type="time"
                          defaultValue={formatDate(
                            flight.arrival?.arrivalTime ?? new Date(),
                            "hh:mm",
                          )}
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
                            defaultValue={flight.arrival?.flightNumber}
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
                            defaultValue={flight.arrival?.destinations}
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
                            defaultValue={flight.arrival?.referenceTicket}
                            onChange={(e) =>
                              setInternationalFlights((prev) => {
                                prev[i].arrival.referenceTicket =
                                  e.target.value;
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
                                  !flight.departure?.departureDate &&
                                    "text-muted-foreground",
                                )}
                              >
                                {flight.departure?.departureDate ? (
                                  `${format(flight.departure?.departureDate, "PPP")}`
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
                              selected={flight.departure?.departureDate}
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
                          {internationalFlights[i].departure?.departureTime
                            ? format(
                                internationalFlights[i].departure
                                  .departureTime!,
                                "HH:mm",
                              )
                            : "--:--"}
                        </div>
                        <Input
                          type="time"
                          defaultValue={formatDate(
                            flight.departure?.departureTime ?? new Date(),
                            "HH:mm",
                          )}
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
                            defaultValue={flight.departure?.flightNumber}
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
                            defaultValue={flight.departure?.destinations}
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
                      <FormItem className="flex flex-grow flex-col justify-start">
                        <FormLabel>Reference ticket</FormLabel>
                        <FormControl>
                          <Input
                            defaultValue={flight.departure?.referenceTicket}
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
                    <FormLabel className="flex flex-col gap-y-2">
                      Ticket
                      <UploadImage
                        title="Upload International Flights Ticket"
                        images={flight.urls ?? []}
                        setImages={(images) => {
                          setInternationalFlights((prev) => {
                            prev[i].urls = images;
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
                      hidden:
                        internationalFlights?.length < 2 ||
                        type === "reservation" ||
                        type === "aviation",
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
                className={cn("self-start", {
                  hidden: type === "reservation" || type === "aviation",
                })}
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
                            checked={flight.arrival?.included}
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
                                  !flight.arrival?.arrivalDate &&
                                    "text-muted-foreground",
                                )}
                              >
                                {flight.arrival?.arrivalDate ? (
                                  `${format(flight.arrival?.arrivalDate, "PPP")}`
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
                              selected={flight.arrival?.arrivalDate}
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
                          {domesticFlights[i].arrival?.arrivalTime
                            ? format(
                                domesticFlights[i].arrival.arrivalTime!,
                                "HH:mm",
                              )
                            : "--:--"}
                        </div>
                        <Input
                          type="time"
                          defaultValue={formatDate(
                            flight.arrival?.arrivalTime ?? new Date(),
                            "HH:mm",
                          )}
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
                            defaultValue={flight.arrival?.flightNumber}
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
                            defaultValue={flight.arrival?.from}
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
                            defaultValue={flight.arrival?.to}
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
                            checked={flight.arrival?.issued}
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
                            checked={flight.departure?.included}
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
                                  !flight.departure?.departureDate &&
                                    "text-muted-foreground",
                                )}
                              >
                                {flight.departure?.departureDate ? (
                                  `${format(flight.departure?.departureDate, "PPP")}`
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
                              selected={flight.departure?.departureDate}
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
                        <FormLabel>Departure Time</FormLabel>
                        <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                          {domesticFlights[i].departure?.departureTime
                            ? format(
                                domesticFlights[i].departure?.departureTime!,
                                "HH:mm",
                              )
                            : "--:--"}
                        </div>
                        <Input
                          type="time"
                          defaultValue={formatDate(
                            flight.departure?.departureTime ?? new Date(),
                            "HH:mm",
                          )}
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
                            defaultValue={flight.departure?.flightNumber}
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
                            defaultValue={flight.departure?.from}
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
                            defaultValue={flight.departure?.to}
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
                            checked={flight.departure?.issued}
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
                    <FormLabel className="flex flex-col gap-y-2">
                      Ticket
                      <UploadImage
                        title="Upload Domestic Flights Ticket"
                        images={flight.urls ?? []}
                        setImages={(images) => {
                          setDomesticFlights((prev) => {
                            prev[i].urls = images;
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
                      hidden:
                        internationalFlights?.length < 2 ||
                        type === "reservation" ||
                        type === "aviation",
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
                className={cn("self-start", {
                  hidden: type === "reservation" || type === "aviation",
                })}
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
        </div>
        <section>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold text-sky-900">
              Reservations
            </h2>
            {type === "booking" && (
              <Button
                variant="secondary"
                disabled={
                  !itineraries?.length ||
                  !form.watch("arrivalDepartureDate.from")
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
            )}
          </div>
          {!!reservationsList?.length &&
            !!form.watch("arrivalDepartureDate")?.from && (
              <Reservations
                reservationsList={reservationsList}
                setReservationsList={setReservationsList}
                tourCountries={tourCountries}
                type={type}
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

function Reservations({
  reservationsList,
  type,
  tourCountries,
  setReservationsList,
}: {
  reservationsList: Reservation[];
  type?: "booking" | "reservation" | "aviation";
  tourCountries: SelectCountries[];
  setReservationsList: (
    cb: (reservationsList: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [editedReservation, setEditedReservation] = useState<
    (Reservation & { index: number })[]
  >([]);
  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);

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
            <TableHead>Currency</TableHead>
            <TableHead>Target Price</TableHead>
            <TableHead>Final Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservationsList?.map(
            (
              {
                start,
                end,
                city,
                hotels,
                meal,
                targetPrice,
                currency,
                bookingId,
                finalPrice,
              },
              index,
            ) => (
              <TableRow
                key={generateRandomId()}
                onClick={
                  type === "booking"
                    ? () => {
                        setEditedReservation([
                          {
                            start,
                            end,
                            city,
                            hotels: [...hotels!],
                            meal,
                            targetPrice,
                            index,
                            currency,
                            bookingId,
                            finalPrice,
                          },
                        ]);
                        setIsEditReservationOpen(true);
                      }
                    : undefined
                }
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
                <TableCell>{currency}</TableCell>
                <TableCell>{targetPrice}</TableCell>
                {type === "reservation" ? (
                  <TableCell>
                    <Input
                      placeholder="Final price..."
                      defaultValue={finalPrice ?? undefined}
                      type="number"
                      onBlur={(e) =>
                        setReservationsList((prev) => {
                          prev[index].finalPrice = isNaN(e.target.valueAsNumber)
                            ? 0
                            : e.target.valueAsNumber;
                          return [...prev];
                        })
                      }
                    />
                  </TableCell>
                ) : (
                  <TableCell>{finalPrice}</TableCell>
                )}
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
      {type === "booking" && (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => setIsAddReservationOpen(true)}
        >
          Add Reservation
        </Button>
      )}
      {!!editedReservation?.length && (
        <EditReservationModal
          isOpen={isEditReservationOpen}
          setIsOpen={setIsEditReservationOpen}
          editedReservation={editedReservation}
          setEditedReservation={setEditedReservation}
          setReservationsList={setReservationsList}
        />
      )}
      {isAddReservationOpen && (
        <AddReservationModal
          isOpen={isAddReservationOpen}
          setIsOpen={setIsAddReservationOpen}
          setReservationsList={setReservationsList}
          selectedCountry={tourCountries[0]}
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
              <TableHead>Currency</TableHead>
              <TableHead>Target Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedReservation?.map((reservation, i) => (
              <ReservationTableRow
                key={generateRandomId()}
                {...reservation}
                index={i}
                listLength={editedReservation?.length}
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
              setEditedReservation((prev) => [
                ...prev,
                {
                  start: null,
                  end: prev[prev?.length - 1].end,
                  hotels: [],
                  meal: null,
                  targetPrice: null,
                  index: prev[prev?.length - 1].index + 1,
                  city: prev[0].city,
                  currency: "USD",
                  bookingId: prev[prev?.length - 1].bookingId,
                  finalPrice: null,
                },
              ]);
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
  meal,
  targetPrice,
  cityHotels,
  index,
  listLength,
  editedReservation,
  currency,
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
  const [endAt, setEndAt] = useState<Date | null>(end);
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
                selected={endAt ?? undefined}
                onSelect={(date) => {
                  setEndAt(date ?? null);
                  setEditedReservation((prev) => {
                    prev[index + 1].start = date ?? null;
                    prev[index].end = date ?? null;
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
          <PopoverTrigger asChild disabled={!cityHotels?.length}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={hotelsOpen}
              className="w-full justify-between overflow-hidden"
            >
              {editedReservation[index].hotels?.length
                ? editedReservation[index].hotels?.map((hotel) =>
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
                {cityHotels?.map(({ id, name }) => (
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
          defaultValue={meal ?? undefined}
          onBlur={(e) =>
            setEditedReservation((prev) => {
              prev[index].meal = e.target.value;
              return [...prev];
            })
          }
        />
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            setEditedReservation(() => {
              editedReservation[index].currency = value;
              return [...editedReservation];
            })
          }
          defaultValue={currency ?? "USD"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a currency" />
          </SelectTrigger>
          <SelectContent>
            {["USD", "EUR", "EGP"]?.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          defaultValue={targetPrice ?? undefined}
          placeholder="Price..."
          type="number"
          onBlur={(e) => {
            setEditedReservation(() => {
              editedReservation[index].targetPrice = e.target.valueAsNumber;
              return [...editedReservation];
            });
          }}
        />
      </TableCell>
    </TableRow>
  );
}

function AddReservationModal({
  isOpen,
  selectedCountry,
  setIsOpen,
  setReservationsList,
}: {
  isOpen: boolean;
  selectedCountry: SelectCountries;
  setIsOpen: (value: boolean) => void;
  setReservationsList: (
    cb: (reservations: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [cities, setCities] = useState<SelectCities[]>([]);
  const [selectedCity, setSelectedCity] = useState<SelectCities | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });
  const [cityHotels, setCityHotels] = useState<SelectHotels[]>([]);
  const [meal, setMeal] = useState("");
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");

  const listCityHotels = useCallback(async (city: SelectCities) => {
    try {
      const hotels = await getCityHotels({
        countryId: selectedCountry.id,
        cityId: city.id,
      });
      setCityHotels(hotels);
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listCities = useCallback(async () => {
    try {
      const cities = await getCountryCities(selectedCountry.id);
      setCities(cities);
    } catch (error) {
      console.error(error);
    }
  }, [selectedCountry]);

  useEffect(() => {
    listCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) {
          setCityHotels([]);
        }
      }}
    >
      <DialogContent className="max-h-screen min-w-[1280px] gap-y-2 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Reservation</DialogTitle>
        </DialogHeader>
        <Table className="mt-4 rounded border">
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Start ⟹ End</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Meal</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Target Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
                  <PopoverTrigger asChild disabled={!cities?.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={citiesOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {selectedCity ? selectedCity.name : "Select a city"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandEmpty>No cities found.</CommandEmpty>
                      <CommandGroup>
                        {cities?.map((city) => (
                          <CommandItem
                            key={city.id}
                            className="flex items-center gap-x-2"
                          >
                            <Checkbox
                              checked={city.name === selectedCity?.name}
                              onCheckedChange={async (checked) => {
                                if (checked) {
                                  setSelectedCity(city);
                                  setCityHotels([]);
                                  await listCityHotels(city);
                                } else {
                                  setSelectedCity(null);
                                  setCityHotels([]);
                                }
                                setCitiesOpen(false);
                              }}
                            />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !dateRange.from &&
                          !dateRange.to &&
                          "text-muted-foreground",
                      )}
                    >
                      {dateRange.from && dateRange.to ? (
                        `${format(dateRange.from, "PPP")} ⟹ ${format(dateRange.to, "PPP")}`
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(value) => {
                        setDateRange({ from: value?.from, to: value?.to });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>
                <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
                  <PopoverTrigger asChild disabled={!cityHotels?.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={hotelsOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {selectedHotels?.length
                        ? selectedHotels.map((name) => capitalize(`${name} ,`))
                        : "Select a hotel"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search hotel..." />
                      <CommandEmpty>No hotels found.</CommandEmpty>
                      <CommandGroup>
                        {cityHotels?.map(({ id, name }) => (
                          <CommandItem
                            key={id}
                            className="flex items-center gap-x-2"
                          >
                            <Checkbox
                              checked={selectedHotels.includes(name ?? "")}
                              onCheckedChange={async (checked) => {
                                if (checked) {
                                  setSelectedHotels((prev) => [
                                    ...prev,
                                    name ?? "",
                                  ]);
                                } else {
                                  setSelectedHotels((prev) =>
                                    prev.filter((hotel) => hotel !== name),
                                  );
                                  setCityHotels([]);
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
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => setCurrency(value)}
                  defaultValue={"USD"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "EGP"]?.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  defaultValue={targetPrice ?? undefined}
                  placeholder="Target price..."
                  type="number"
                  onChange={(e) =>
                    setTargetPrice(Math.max(0, e.target.valueAsNumber))
                  }
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DialogFooter className="flex w-full justify-between pt-4">
          <div className="flex gap-x-2">
            <Button type="button" variant={"outline"}>
              Cancel
            </Button>
            <Button
              className="flex gap-x-1"
              onClick={() => {
                setReservationsList((prev) => {
                  const reservation: Reservation = {
                    city: selectedCity,
                    currency,
                    targetPrice,
                    meal,
                    hotels: selectedHotels,
                    start: dateRange.from ?? null,
                    end: dateRange.to ?? null,
                    bookingId: prev[prev?.length - 1].bookingId,
                    finalPrice,
                  };
                  return [...prev, reservation].sort((a, b) => {
                    if (!a.start || !b.start) return -1;
                    if (a.start === b.start) {
                      if (!a.end || !b.end) return -1;
                      return a.end?.getTime() - b.end?.getTime();
                    }
                    return a.start?.getTime() - b.start?.getTime();
                  });
                });
                setCityHotels([]);
                setCities([]);
                setIsOpen(false);
              }}
            >
              Create
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

function UploadImage({
  images,
  setImages,
  title,
  button,
  maxNumber,
}: {
  images: { image?: ImageType; name?: string; url?: string }[];
  setImages: (
    images: { image?: ImageType; name?: string; url?: string }[],
  ) => void;
  title: string;
  button: React.ReactElement;
  maxNumber?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onChange = (imageList: ImageListType) => {
    setImages(
      imageList.map((image) =>
        image.name !== undefined
          ? (image as { image: ImageType; name: string; url: string })
          : {
              image,
              name: image.file?.name ?? "",
              url: image.file ? URL.createObjectURL(image.file) : "",
            },
      ),
    );
  };

  const TriggerButton = React.cloneElement(button, {
    onClick: () => setIsOpen(true),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {TriggerButton}
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-2">
        <DialogHeader>
          <DialogTitle className="mb-2">{title}</DialogTitle>
          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
            allowNonImageType
          >
            {({
              imageList,
              onImageUpload,
              onImageRemove,
              isDragging,
              dragProps,
              errors,
            }) => (
              <div className="upload__image-wrapper">
                <div
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                  className="mb-4 flex h-24 w-full items-center justify-center gap-x-2 rounded border-2 border-dashed border-sky-900 border-opacity-30"
                >
                  <File />
                  <p className="font-medium">Click or Drop here</p>
                </div>
                <div className="grid max-h-[76vh] grid-cols-4 gap-4 overflow-y-auto p-2">
                  {imageList.map(({ image, name, url }, index) => (
                    <div
                      key={index}
                      className="image-item relative flex flex-col items-center justify-center gap-y-2"
                    >
                      <a
                        href={url}
                        target="_blank"
                        className="flex flex-grow flex-col items-center"
                      >
                        <File size={128} strokeWidth={1} />
                        <p className="text-center">{name}</p>
                      </a>

                      <XCircle
                        size={28}
                        className="absolute -right-2 -top-2 cursor-pointer text-white"
                        onClick={() => onImageRemove(index)}
                        fill="red"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ImageUploading>
        </DialogHeader>
        <DialogFooter className="flex w-full justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setImages([]);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
