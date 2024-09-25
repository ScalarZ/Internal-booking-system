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
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function FilterBookings({
  countries,
}: {
  countries: SelectCountries[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from:
      params
        .get("dateRange")
        ?.split("|")
        .map((date) => new Date(date))[0] ?? undefined,
    to:
      params
        .get("dateRange")
        ?.split("|")
        .map((date) => new Date(date))[1] ?? undefined,
  });
  const [id, setId] = useState<string | undefined>(
    params.get("id") ?? undefined,
  );
  async function handleFilterBookings(filters?: BookingFilters) {
    try {
      const filteredBookings = await filterBookings({ ...filters });
      queryClient.setQueryData(["bookings"], filteredBookings);
    } catch (error) {
      console.error(error);
    }
  }
  const addQuery = (name: string, value: string) => {
    params.set(name, value);
    router.replace(`?${params.toString()}`);
  };

  const removeQuery = (name: string) => {
    params.delete(name);
    router.replace(`?${params.toString()}`);
  };

  const debouncedValue = useDebounce(id, 500);

  useEffect(() => {
    if (!debouncedValue) {
      removeQuery("id");
      return;
    }
    addQuery("id", debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  useEffect(() => {
    const dateRange = params.get("dateRange");
    const country = params.get("country") ?? undefined;
    const id = params.get("id") ?? undefined;

    if (!dateRange && !country && !id) return;

    const from =
      dateRange?.split("|").map((date) => new Date(date))[0] ?? undefined;
    const to =
      dateRange?.split("|").map((date) => new Date(date))[1] ?? undefined;

    const filter = {
      dateRange: {
        from: from && !isNaN(from.getTime()) ? from : undefined,
        to: to && !isNaN(to.getTime()) ? to : undefined,
      },
      country,
      id,
    };
    handleFilterBookings(filter);
  }, [params]);

  return (
    <div className="flex w-full gap-x-4">
      <Select
        defaultValue={params.get("country") ?? "select-country"}
        onValueChange={(value) =>
          value !== "select-country"
            ? addQuery("country", value)
            : removeQuery("country")
        }
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
              !dateRange?.from && !dateRange?.to && "text-muted-foreground",
            )}
          >
            {dateRange?.from && dateRange?.to ? (
              `${format(dateRange.from, "PPP")} ⟹ ${format(dateRange.to, "PPP")}`
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
              from: dateRange?.from,
              to: dateRange?.to,
            }}
            onSelect={async (value) => {
              setDateRange({ from: value?.from, to: value?.to });
              if (!value?.from || !value?.to) return removeQuery("dateRange");
              addQuery(
                "dateRange",
                `${value.from.toISOString()}|${value.to.toISOString()}`,
              );
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
