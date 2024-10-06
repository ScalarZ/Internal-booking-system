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
import useURLQuery from "@/hooks/use-url-query";
import { cn } from "@/lib/utils";
import { filterBookings } from "@/utils/db-queries/booking";
import { queryClient } from "@/utils/provider";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function FilterBookings({
  countries,
}: {
  countries: SelectCountries[];
}) {
  const { params, addQuery, removeQuery } = useURLQuery();
  const country_ = params.get("country") ?? undefined;
  const id_ = params.get("id") ?? undefined;
  const dateRange_ =
    params
      .get("dateRange")
      ?.split("|")
      .map((date) => new Date(date)) ?? [];
  const [country, setCountry] = useState<string | undefined>(country_);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: dateRange_[0],
    to: dateRange_[1],
  });
  const [id, setId] = useState<string | undefined>(id_);
  const debouncedId = useDebounce(id, 500);

  const { data: filteredBookings } = useQuery({
    queryKey: ["filteredBookings", country, debouncedId, dateRange],
    queryFn: () =>
      filterBookings({
        dateRange: {
          from:
            dateRange?.from && !isNaN(dateRange.from.getTime())
              ? dateRange.from
              : undefined,
          to:
            dateRange?.to && !isNaN(dateRange.to.getTime())
              ? dateRange.to
              : undefined,
        },
        country,
        id: debouncedId,
      }),
    enabled: !!(country || debouncedId || dateRange.from || dateRange.to),
  });

  useEffect(() => {
    if (!debouncedId) {
      removeQuery("id");
      return;
    }
    addQuery("id", debouncedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedId]);

  useEffect(() => {
    if (filteredBookings) {
      queryClient.setQueryData(["bookings"], filteredBookings);
    }
  }, [filteredBookings]);

  return (
    <div className="flex w-full gap-x-4">
      <Select
        defaultValue={country_ ?? "select-country"}
        onValueChange={(value) => {
          if (value !== "select-country") {
            setCountry(value);
            addQuery("country", value);
          } else {
            setCountry(undefined);
            removeQuery("country");
          }
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
              !dateRange.from && !dateRange.to && "text-muted-foreground",
            )}
          >
            {dateRange.from && dateRange.to ? (
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
            selected={dateRange}
            onSelect={async (value) => {
              setDateRange({
                from: value?.from
                  ? new Date(format(value.from, "yyyy-MM-dd"))
                  : undefined,
                to: value?.to
                  ? new Date(format(value.to, "yyyy-MM-dd"))
                  : undefined,
              });
              if (!value?.from || !value?.to) return removeQuery("dateRange");
              addQuery(
                "dateRange",
                `${format(value.from, "yyyy-MM-dd")}|${format(
                  value.to,
                  "yyyy-MM-dd",
                )}`,
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
