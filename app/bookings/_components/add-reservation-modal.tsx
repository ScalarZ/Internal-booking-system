import {
  SelectCities,
  SelectCountries,
  SelectHotels,
  SelectReservations,
} from "@/drizzle/schema";
import { getCityHotels } from "@/utils/db-queries/hotel";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCountryCities } from "@/utils/db-queries/city";
import capitalize from "@/utils/capitalize";
import { format } from "date-fns";

type Reservation = Omit<
  SelectReservations,
  "id" | "createdAt" | "updatedAt" | "bookingId" | "finalPrice"
>;

export default function AddReservationModal({
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
    console.log(selectedCountry);
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
                  <PopoverTrigger asChild disabled={!cities.length}>
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
                  <PopoverTrigger asChild disabled={!cityHotels.length}>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={hotelsOpen}
                      className="w-full justify-between overflow-hidden"
                    >
                      {selectedHotels.length
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
