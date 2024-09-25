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
import {
  activities,
  SelectActivities,
  SelectCities,
  SelectCountries,
  SelectGuides,
} from "@/drizzle/schema";
import useURLQuery from "@/hooks/use-url-query";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function Filters({
  cities,
  countries,
  activities,
  guides,
}: {
  countries: SelectCountries[];
  cities: SelectCities[];
  activities: SelectActivities[];
  guides: SelectGuides[];
}) {
  function getList(
    list: SelectCountries[] | SelectCities[] | SelectActivities[],
  ) {
    return list.map(({ id, name }) => ({ id, name: name! }));
  }
  return (
    <div className="grid grid-cols-4 gap-x-8">
      <CountryFilter countries={countries} />
      <DateFilter
        list={getList(cities)}
        valueQueryName="city"
        dateQueryName="cityDateRange"
      />
      <DateFilter
        list={getList(activities)}
        valueQueryName="activity"
        dateQueryName="activityDateRange"
      />
      <DateFilter
        list={getList(guides)}
        valueQueryName="guide"
        dateQueryName="guideDateRange"
      />
    </div>
  );
}

function CountryFilter({ countries }: { countries: SelectCountries[] }) {
  const { addQuery, params, restQuery } = useURLQuery();
  const country = params.get("country");

  return (
    <div className="flex flex-col gap-y-2">
      <Select
        defaultValue={country ?? "Egypt"}
        onValueChange={(value) => addQuery("country", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          {countries?.map(({ id, name }) => (
            <SelectItem key={id} value={name ?? ""}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant={"secondary"} onClick={restQuery}>
        Reset Filters
      </Button>
    </div>
  );
}

function DateFilter({
  list,
  valueQueryName,
  dateQueryName,
}: {
  list: { id: string; name: string }[];
} & (
  | {
      valueQueryName: "city";
      dateQueryName: "cityDateRange";
    }
  | {
      valueQueryName: "activity";
      dateQueryName: "activityDateRange";
    }
  | {
      valueQueryName: "guide";
      dateQueryName: "guideDateRange";
    }
)) {
  const { addQuery, removeQuery, params } = useURLQuery();
  const dateRangeQuery = params.get(dateQueryName);
  const valueQuery = params.get(valueQueryName);
  const [value, setValue] = useState<string | null>(valueQuery);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from:
      dateRangeQuery?.split("|").map((date) => new Date(date))[0] ?? undefined,
    to:
      dateRangeQuery?.split("|").map((date) => new Date(date))[1] ?? undefined,
  });

  function handleQueryChange(
    value: string | null,
    dateRange: { from?: Date; to?: Date },
  ) {
    if (value && dateRange?.from && dateRange?.to) {
      addQuery(valueQueryName, value);
      addQuery(
        dateQueryName,
        `${format(dateRange.from, "yyyy-MM-dd")}|${format(dateRange.to, "yyyy-MM-dd")}`,
      );
      return;
    }
    removeQuery(valueQueryName);
    removeQuery(dateQueryName);
  }

  useEffect(() => {
    setValue(valueQuery);
    setDateRange({
      from:
        dateRangeQuery?.split("|").map((date) => new Date(date))[0] ??
        undefined,
      to:
        dateRangeQuery?.split("|").map((date) => new Date(date))[1] ??
        undefined,
    });
  }, [valueQuery, dateRangeQuery]);

  return (
    <div className="flex flex-col gap-y-2">
      <Select
        defaultValue={value ?? "select-" + valueQueryName}
        onValueChange={(v) => {
          if (v === "select-" + valueQueryName) setValue(null);
          else setValue(v);

          handleQueryChange(v !== "select-" + valueQueryName ? v : null, {
            from: dateRange?.from,
            to: dateRange?.to,
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={"Select a " + valueQueryName} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"select-" + valueQueryName}>
            Select a {valueQueryName}
          </SelectItem>
          {list?.map(({ id, name }) => (
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
              "flex w-full justify-between pl-3 text-left font-normal",
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
            onSelect={async (date) => {
              setDateRange({ from: date?.from, to: date?.to });
              handleQueryChange(value, { from: date?.from, to: date?.to });
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
