"use client";

import { format, isValid, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
} from "lucide-react";
import useURLQuery from "@/hooks/use-url-query";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { getCities } from "@/utils/db-queries/city";
import { useQuery } from "@tanstack/react-query";
import { useTraffic } from "./traffic-context";

export default function TrafficFilter() {
  // Add state for selected city

  return (
    <div className="flex gap-x-2">
      <DateFilter />
      <CityFilter />
    </div>
  );
}

function DateFilter() {
  const { addQuery, removeQuery, params } = useURLQuery();
  const date = params.get("date");
  const [value, setValue] = useState<Date>(
    date && isValid(new Date(date)) ? new Date(date) : new Date(),
  );

  const handleDateChange = (newDate: Date) => {
    setValue(newDate);
    if (newDate) {
      addQuery("date", format(newDate, "yyyy-MM-dd"));
    } else {
      removeQuery("date");
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleDateChange(subDays(value, 1))}
        disabled={!value}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "flex max-w-40 justify-between pl-3 text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            {value ? `${format(value, "PPP")}` : <span>Date</span>}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => date && handleDateChange(date)}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleDateChange(addDays(value, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function CityFilter() {
  const { addQuery, params } = useURLQuery();
  const city = params.get("city");
  const { cities } = useTraffic();
  const [selectedCity, setSelectedCity] = useState<string | null>(city);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    addQuery("city", city);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {selectedCity ?? "Select city"}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandEmpty>No city found.</CommandEmpty>
          <CommandGroup>
            {cities?.map((city) => (
              <CommandItem
                key={city.id}
                onSelect={() => handleCityChange(city.name!)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCity === city.name ? "opacity-100" : "opacity-0",
                  )}
                />
                {city.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
