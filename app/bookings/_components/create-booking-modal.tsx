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
  Loader,
  Plus,
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
  SelectActivities,
  SelectCompanies,
  SelectCountries,
  SelectGuides,
  SelectHotels,
  SelectNationalities,
  SelectTours,
} from "@/drizzle/schema";
import capitalize from "@/utils/capitalize";
import { listCountryGuides } from "@/utils/list-country-guides";
import { addBookings } from "@/utils/db-queries/booking";

export default function CreateBookingModal({
  countries,
  companies,
  tours,
  nationalities,
  hotels,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  nationalities: SelectNationalities[];
  hotels: SelectHotels[];
  tours: SelectTours[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="mb-4 flex w-full justify-end">
        <Button onClick={() => setIsOpen(true)}>Add</Button>
      </div>
      <DialogContent className="min-w-[1360px] gap-y-4 overflow-y-auto">
        <DialogHeader className="capitalize">
          <DialogTitle>Add New Booking</DialogTitle>
        </DialogHeader>
        <From
          countries={countries}
          companies={companies}
          tours={tours}
          nationalities={nationalities}
          hotels={hotels}
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
  country: z.string({ required_error: "Please select a country" }),
  // city: z.string({ required_error: "Please select a city" }),
  tour: z.string({ required_error: "Please select a tour" }),
  company: z.string({ required_error: "Please select a company" }),
  guide: z.string({ required_error: "Please select a guide" }),
  currency: z.string({ required_error: "Please select a currency" }),
  arrivalDate: z.date({ required_error: "Please select an arrival date" }),
  departureDate: z.date({ required_error: "Please select an departure date" }),
  hotels: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Please select at least one hotel.",
  }),
  // activities: z
  //   .array(z.string())
  //   .refine((value) => value.some((item) => item), {
  //     message: "Please select at least one hotel.",
  //   }),
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
});

function From({
  countries,
  companies,
  tours,
  hotels,
  nationalities,
  closeModal,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  tours: SelectTours[];
  hotels: SelectHotels[];
  nationalities: SelectNationalities[];
  closeModal: () => void;
}) {
  const [tourOpen, setTourOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  // const [cityOpen, setCityOpen] = useState(false);
  // const [activityOpen, setActivityOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [touristsNames, setTouristsNames] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  // const [cityId, setCityId] = useState("");
  // const [citiesList, setCitiesList] = useState<SelectCountries[]>([]);
  // const [hotelsList, setHotelsList] = useState<SelectHotels[]>([]);
  const [guidesList, setGuidesList] = useState<SelectGuides[]>([]);
  // const [activitiesList, setActivitiesList] = useState<SelectActivities[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalBookingId, setInternalBookingId] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotels: [],
      // activities: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await addBookings({
        arrivalDate: values.arrivalDate,
        company: values.company,
        currency: values.currency,
        departureDate: values.departureDate,
        double: values.doubleRoom ?? 0,
        generalNote: values.generalNote ?? null,
        hotels: values.hotels,
        // activities: values.activities,
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
        country: values.country,
        // city: values.city,
        guide: values.guide,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      form.reset();
      closeModal();
    }
  }

  useEffect(() => {
    if (!countryId) return;
    // listCountryCities({ countryId, setCitiesList });
    listCountryGuides({ countryId, setGuidesList });
  }, [countryId]);

  // useEffect(() => {
  //   if (!countryId || !cityId) return;
  //   listCityHotels({ countryId, cityId, setHotelsList });
  //   listCityActivities({ countryId, cityId, setActivitiesList });
  // }, [countryId, cityId]);

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
                variant={"secondary"}
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
                      className="w-full justify-between"
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
                        {tours.map(({ id, name }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setTourOpen(false);
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
            name="country"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Country</FormLabel>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between"
                    >
                      {field.value ? field.value : "Select a country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map(({ id, name }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setCountryOpen(false);
                              setCountryId(id);
                              // setCityId("");
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
          {/* <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">City</FormLabel>
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger asChild disabled={!citiesList.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={cityOpen}
                      className="w-full justify-between"
                    >
                      {field.value ? field.value : "Select a city"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {citiesList.map(({ id, name }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setCityOpen(false);
                              setCityId(id);
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
          /> */}
          <FormField
            control={form.control}
            name="guide"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Guide</FormLabel>
                <Popover open={guideOpen} onOpenChange={setGuideOpen}>
                  <PopoverTrigger asChild disabled={!guidesList.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={guideOpen}
                      className="w-full justify-between"
                    >
                      {field.value ? field.value : "Select a guide"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search guide..." />
                      <CommandEmpty>No guide found.</CommandEmpty>
                      <CommandGroup>
                        {guidesList.map(({ id, name }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setGuideOpen(false);
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
            name="hotels"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Hotels</FormLabel>
                <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
                  <PopoverTrigger asChild disabled={!hotels.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={hotelsOpen}
                      className="w-full justify-between"
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
                        {hotels.map(({ id, name }) => (
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
          {/* <FormField
            control={form.control}
            name="activities"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Activities</FormLabel>
                <Popover open={activityOpen} onOpenChange={setActivityOpen}>
                  <PopoverTrigger asChild disabled={!hotelsList.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={activityOpen}
                      className="w-full justify-between"
                    >
                      {field.value.length
                        ? field.value.map((activity) =>
                            capitalize(`${activity}, `),
                          )
                        : "Select activities"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search activity..." />
                      <CommandEmpty>No activity found.</CommandEmpty>
                      <CommandGroup>
                        {activitiesList.map(({ id, name }) => (
                          <CommandItem key={id}>
                            <FormField
                              control={form.control}
                              name="activities"
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
          /> */}
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
                      className="w-full justify-between"
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
    </Form>
  );
}
