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
import { cn } from "@/lib/utils";
import { filterBookings } from "@/utils/db-queries/booking";
import { queryClient } from "@/utils/provider";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function Filters({
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

  return (
    <div className="flex w-full gap-x-4">
      <Select
        defaultValue={params.get("country") ?? "Egypt"}
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
          {countries?.map(({ id, name }) => (
            <SelectItem key={id} value={name ?? ""}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
