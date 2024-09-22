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
  SelectCountries,
  SelectGuidesWithCountries,
} from "@/drizzle/schema";
import { useQuery } from "@tanstack/react-query";
import ItineraryCard from "./itinerary-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Filters from "./filters";
import { useRouter, useSearchParams } from "next/navigation";
import BookingModal from "@/app/bookings/_components/booking-modal";
import { useBooking } from "@/context/booking-context";

const WeeklyCalendar = ({
  guides,
  countries,
}: {
  guides: SelectGuidesWithCountries[];
  countries: SelectCountries[];
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );
  const country = params.get("country");

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { setBooking, setIsEditModalOpen } = useBooking();

  const {
    data: bookings,
    error,
    isLoading,
  } = useQuery({
    queryKey: [format(currentWeek, "yyyy-MM-dd")],
    queryFn: () => getWeeklyItineraries(currentWeek),
  });

  console.log(bookings);
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
    <>
      <div className="flex flex-col justify-center gap-y-4">
        <Filters countries={countries} />
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
          {bookings
            ?.filter(({ countries }) =>
              countries
                ?.map((country) => country.toLowerCase())
                ?.includes((country ?? "Egypt").toLowerCase()),
            )
            ?.sort((a, b) =>
              (a.internalBookingId ?? "")
                .toLowerCase()
                .localeCompare((b.internalBookingId ?? "").toLowerCase()),
            )
            ?.map((booking) => {
              return (
                <div key={booking.id} className="relative flex w-full grow">
                  <div
                    className="absolute left-0 top-0 max-w-[200px] origin-bottom-right -translate-x-full -translate-y-full -rotate-90 cursor-pointer bg-yellow-400 p-1 text-xs"
                    onClick={() => {
                      params.set("bookingId", booking.internalBookingId!);
                      router.replace(`?${params.toString()}`);
                    }}
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
