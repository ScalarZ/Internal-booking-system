import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { SelectCountries } from "@/drizzle/schema";
import useDebounce from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { filterBookings } from "@/utils/db-queries/booking";
import { queryClient } from "@/utils/provider";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function FilterBookings({
  countries,
}: {
  countries: SelectCountries[];
}) {
  const [filters, setFilters] = useState<BookingFilters>({});
  const [id, setId] = useState<string | undefined>(undefined);
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
    if (debouncedValue === undefined) return;
    setFilters((prev) => ({ ...prev, id: debouncedValue }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  useEffect(() => {
    handleFilterBookings(filters);
  }, [filters]);

  return (
    <div className="flex w-full gap-x-4">
      <Select
        onValueChange={(value) => {
          setFilters((prev) => ({
            ...prev,
            country: value !== "select-country" ? value : undefined,
          }));
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"select-country"}>Select a country</SelectItem>
          {countries?.map(({ id, name }) => (
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
              !filters.dateRange?.from &&
                !filters.dateRange?.to &&
                "text-muted-foreground",
            )}
          >
            {filters.dateRange?.from && filters.dateRange?.to ? (
              `${format(filters.dateRange.from, "PPP")} ⟹ ${format(filters.dateRange.to, "PPP")}`
            ) : (
              <span>Arrival ⟹ Departure</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.dateRange?.from,
              to: filters.dateRange?.to,
            }}
            onSelect={async (value) => {
              setFilters((prev) => ({
                ...prev,
                dateRange: {
                  from: value?.from,
                  to: value?.to,
                },
              }));
            }}
          />
        </PopoverContent>
      </Popover>
      <Input
        value={id}
        placeholder="Search by Internal booking ID..."
        onChange={(e) => {
          setId(e.target.value);
        }}
      />
    </div>
  );
}
