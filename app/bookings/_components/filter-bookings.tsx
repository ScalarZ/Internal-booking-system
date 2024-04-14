import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SelectBookings, SelectCountries } from "@/drizzle/schema";
import useDebounce from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { filterBookings } from "@/utils/db-queries/booking";
import getQueryClient from "@/utils/get-query-provider";
import { queryClient } from "@/utils/provider";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function FilterBookings({
  countries,
}: {
  countries: SelectCountries[];
}) {
  const [filters, setFilters] = useState<BookingFilters>({
    country: null,
    arrivalDate: null,
    departureDate: null,
  });
  const [id, setId] = useState<string | null>(null);

  async function handleFilterBookings(filters?: BookingFilters) {
    try {
      const filteredBookings = await filterBookings({ ...filters });
      queryClient.setQueryData(["bookings"], filteredBookings);
    } catch (error) {
      console.error(error);
    }
  }

  const debouncedValue = useDebounce(id, 500);

  useEffect(() => {
    if (debouncedValue !== null) {
      console.log("debounced");
      handleFilterBookings({ id: debouncedValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  // useEffect(() => {
  //   if (
  //     Object.entries(filters).some(
  //       (key_value) =>
  //         (key_value[1] !== null &&
  //           typeof key_value[1] === "object" &&
  //           "from" in key_value[1] &&
  //           "to" in key_value[1] &&
  //           key_value[1].from &&
  //           key_value[1].to) ||
  //         (key_value[1] !== null && typeof key_value[1] === "string"),
  //     )
  //   ) {
  //     console.log("filter");
  //     handleFilterBookings();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [filters]);

  return (
    <div className="absolute top-0 flex w-2/3 gap-x-4 py-4">
      <Select
        onValueChange={(value) =>
          handleFilterBookings({
            country: value !== "select-country" ? value : "",
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"select-country"}>Select a country</SelectItem>
          {countries.map(({ id, name }) => (
            <SelectItem key={id} value={name ?? ""}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "max-w-max pl-3 text-left font-normal",
              !filters.arrivalDate && "text-muted-foreground",
            )}
          >
            {filters.arrivalDate?.from && filters.arrivalDate?.to ? (
              `${format(filters.arrivalDate.from, "PPP")} _ ${format(filters.arrivalDate.to, "PPP")}`
            ) : (
              <span>Arrival date range</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.arrivalDate?.from,
              to: filters.arrivalDate?.to,
            }}
            onSelect={(value) =>
              handleFilterBookings({
                arrivalDate: { from: value?.from, to: value?.to },
              })
            }
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "max-w-max pl-3 text-left font-normal",
              !filters.departureDate && "text-muted-foreground",
            )}
          >
            {filters.departureDate?.from && filters.departureDate?.to ? (
              `${format(filters.departureDate.from, "PPP")} _ ${format(filters.departureDate.to, "PPP")}`
            ) : (
              <span>Departure date range</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.departureDate?.from,
              to: filters.departureDate?.to,
            }}
            onSelect={(value) => {
              setFilters((prev) => ({
                ...prev,
                departureDate: { from: value?.from, to: value?.to },
              }));
              handleFilterBookings({
                departureDate: { from: value?.from, to: value?.to },
              });
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        placeholder="Search by ID..."
        value={id ?? ""}
        onChange={(e) => setId(e.target.value)}
      />
    </div>
  );
}
