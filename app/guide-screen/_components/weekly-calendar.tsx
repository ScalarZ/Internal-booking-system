"use client";

import React, { useMemo, useState } from "react";

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
  SelectBookingWithItineraries,
  SelectGuidesWithCountries,
} from "@/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import ItineraryCard from "./itinerary-card";

const WeeklyCalendar = ({
  guides,
}: {
  guides: SelectGuidesWithCountries[];
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const {
    data: bookings,
    error,
    isLoading,
  } = useQuery({
    queryKey: [format(currentWeek, "yyyy-MM-dd")],
    queryFn: () => getWeeklyItineraries(currentWeek),
  });
  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subDays(currentWeek, 7));
  };

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

  function calculatePreviousDays(booking: SelectBookingWithItineraries) {
    const itineraries = booking.bookingTour.itineraries?.sort(
      (a, b) =>
        parse(a.day ?? "", "yyyy-MM-dd", new Date()).getTime() -
        parse(b.day ?? "", "yyyy-MM-dd", new Date()).getTime(),
    );
    const startDate = parse(itineraries[0].day ?? "", "yyyy-MM-dd", new Date());
    const daysDifference = differenceInCalendarDays(startDate, weekStart);
    return [...Array(daysDifference)];
  }

  function calculateNextDays(booking: SelectBookingWithItineraries) {
    const itineraries = booking.bookingTour.itineraries?.sort(
      (a, b) =>
        parse(a.day ?? "", "yyyy-MM-dd", new Date()).getTime() -
        parse(b.day ?? "", "yyyy-MM-dd", new Date()).getTime(),
    );
    const startDate = parse(
      itineraries?.at(-1)?.day ?? "",
      "yyyy-MM-dd",
      new Date(),
    );
    const daysDifference = differenceInCalendarDays(weekEnd, startDate);
    return [...Array(daysDifference)];
  }

  if (error) return <div>Error</div>;

  return (
    <div className="flex flex-col justify-center">
      <div className="flex items-center justify-center gap-x-6">
        <button
          className="rounded-md bg-green-500 p-3 text-white hover:bg-green-600"
          onClick={handlePreviousWeek}
        >
          ←
        </button>
        <div className="flex w-full">{daysOfWeek}</div>
        <button
          className="rounded-md bg-green-500 p-3 text-white hover:bg-green-600"
          onClick={handleNextWeek}
        >
          →
        </button>
      </div>

      {isLoading && <div className="p-16 text-center">Loading...</div>}
      <div className="flex grow flex-col px-16">
        {bookings?.map((booking) => {
          return (
            <div key={booking.id} className="relative flex w-full grow">
              <div className="absolute bottom-0 left-0 origin-top-right -translate-x-full rotate-90 bg-yellow-400 p-2">
                {booking.internalBookingId}
              </div>
              {calculatePreviousDays(booking).map((_, i) => (
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
              {calculateNextDays(booking).map((_, i) => (
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
  );
};

export default WeeklyCalendar;
