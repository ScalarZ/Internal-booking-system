"use client";

import React, { useCallback, useMemo, useState } from "react";

import {
  addDays,
  subDays,
  format,
  startOfWeek,
  parse,
  differenceInCalendarDays,
  endOfWeek,
} from "date-fns";
import { getWeeklyItineraries } from "@/utils/db-queries/booking";
import {
  Bookings,
  SelectActivities,
  SelectBookingWithItineraries,
  SelectCities,
  SelectCountries,
  SelectGuidesWithCountries,
} from "@/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import ItineraryCard from "./itinerary-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Filters from "./filters";
import BookingModal from "@/app/bookings/_components/booking-modal";
import useFilterParams from "@/hooks/use-filter-params";
import { cn } from "@/lib/utils";
import useURLQuery from "@/hooks/use-url-query";

const filterBookings = (
  bookings: (Bookings & { guide_status: "red" | "yellow" | "green" })[],
  filterParams: FilterParams,
) => {
  const { country, city, activity, guide } = filterParams;

  const filterByDate = (dateRange: DateRange | null, day: string) =>
    !dateRange ||
    (new Date(dateRange.from) <= new Date(day) &&
      new Date(dateRange.to) >= new Date(day));

  const compareStringsEquality = (a: string | null, b: string | null) =>
    a?.toLowerCase() === b?.toLowerCase();

  return bookings.filter((booking) => {
    const { countries, bookingTour } = booking;
    return (
      countries?.some((c) => c.toLowerCase() === country.toLowerCase()) &&
      bookingTour.itineraries.some((itinerary) => {
        const { day, cities, activities } = itinerary;
        return (
          (!city.name ||
            cities?.some((c) => compareStringsEquality(c.name, city.name))) &&
          (!city.dateRange || filterByDate(city.dateRange, day!)) &&
          (!activity.name ||
            activities?.some((a) =>
              compareStringsEquality(a.name, activity.name),
            )) &&
          (!activity.dateRange || filterByDate(activity.dateRange, day!)) &&
          (!guide.name ||
            compareStringsEquality(itinerary.guide, guide.name)) &&
          (!guide.dateRange || filterByDate(guide.dateRange, day!))
        );
      })
    );
  });
};

const WeeklyCalendar = ({
  guides,
  ...props
}: {
  guides: SelectGuidesWithCountries[];
  countries: SelectCountries[];
  cities: SelectCities[];
  activities: SelectActivities[];
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  let {
    data: bookings,
    error,
    isLoading,
  } = useQuery({
    queryKey: [format(currentWeek, "yyyy-MM-dd")],
    queryFn: () => getWeeklyItineraries(currentWeek),
  });

  const { addQuery } = useURLQuery();

  const filterParams = useFilterParams();

  const filteredBookings = useMemo(
    () => (bookings ? filterBookings(bookings, filterParams) : []),
    [bookings, filterParams],
  );

  const handleNextWeek = useCallback(
    () => setCurrentWeek((prev) => addDays(prev, 7)),
    [],
  );
  const handlePreviousWeek = useCallback(
    () => setCurrentWeek((prev) => subDays(prev, 7)),
    [],
  );

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const daysOfWeek = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const day = addDays(weekStart, i);
        return (
          <div
            key={i}
            className="flex w-full flex-col items-center justify-center border p-4"
          >
            <div className="mb-2 font-bold">{format(day, "E")}</div>
            <div>{format(day, "MMM dd")}</div>
          </div>
        );
      }),
    [weekStart],
  );

  const calculateDaysDifference = (
    booking: SelectBookingWithItineraries,
    weekBoundary: Date,
    compareToStart: boolean,
  ) => {
    const itineraries = booking.bookingTour.itineraries?.sort(
      (a, b) =>
        parse(a.day ?? "", "yyyy-MM-dd", new Date()).getTime() -
        parse(b.day ?? "", "yyyy-MM-dd", new Date()).getTime(),
    );

    const referenceDate = parse(
      compareToStart
        ? itineraries?.[0]?.day ?? ""
        : itineraries?.at(-1)?.day ?? "",
      "yyyy-MM-dd",
      new Date(),
    );

    return Math.abs(differenceInCalendarDays(referenceDate, weekBoundary));
  };

  if (error) return <div>Error</div>;

  return (
    <>
      <div className="flex flex-col justify-center gap-y-4">
        <Filters {...props} guides={guides} />
        <div className="flex items-center justify-center gap-x-6 px-3">
          <ChevronLeft
            size={30}
            className="cursor-pointer text-sky-900"
            onClick={handlePreviousWeek}
          />
          <div className="flex w-full">{daysOfWeek}</div>
          <ChevronRight
            className="cursor-pointer text-sky-900"
            size={30}
            onClick={handleNextWeek}
          />
        </div>
        {isLoading && <div className="p-16 text-center">Loading...</div>}
        <div className="flex grow flex-col px-16">
          {filteredBookings
            ?.sort((a, b) =>
              (a.internalBookingId ?? "")
                .toLowerCase()
                .localeCompare((b.internalBookingId ?? "").toLowerCase()),
            )
            ?.map((booking) => {
              return (
                <div
                  key={booking.id}
                  className={cn("relative flex w-full grow", {
                    "bg-green-200": booking.guide_status === "green",
                    "bg-red-200": booking.guide_status === "red",
                    "bg-yellow-200": booking.guide_status === "yellow",
                  })}
                >
                  <div
                    className="absolute left-0 top-0 max-w-[200px] origin-bottom-right -translate-x-full -translate-y-full -rotate-90 cursor-pointer bg-yellow-400 p-1 text-xs"
                    onClick={() =>
                      addQuery("bookingId", booking.internalBookingId!)
                    }
                  >
                    {booking.internalBookingId}
                    <span className="text-gray-700">
                      {booking.reservations?.reduce((acc, curr) => {
                        if (!curr.hotels.length) return acc;
                        if (!acc.startsWith(": ")) acc += ": ";
                        return acc + curr.hotels.join(", ");
                      }, "")}
                    </span>
                  </div>
                  {[
                    ...Array(calculateDaysDifference(booking, weekStart, true)),
                  ].map((_, i) => (
                    <div
                      key={i}
                      className="w-full max-w-[293px] grow overflow-auto border p-2"
                    ></div>
                  ))}
                  {booking.bookingTour?.itineraries.map((itinerary, i) => (
                    <ItineraryCard
                      key={itinerary.id}
                      {...itinerary}
                      i={i}
                      guides={guides}
                      currentWeek={currentWeek}
                    />
                  ))}
                  {[
                    ...Array(calculateDaysDifference(booking, weekEnd, false)),
                  ].map((_, i) => (
                    <div
                      key={i}
                      className="w-full max-w-[293px] grow overflow-auto border p-2"
                    ></div>
                  ))}
                </div>
              );
            })}
        </div>
      </div>
      <BookingModal
        modalMode="edit"
        nileCruises={[]}
        companies={[]}
        nationalities={[]}
        tours={[]}
      />
    </>
  );
};

export default WeeklyCalendar;
