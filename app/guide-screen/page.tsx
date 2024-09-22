import React from "react";
import WeeklyCalendar from "./_components/weekly-calendar";
import { getWeeklyItineraries } from "@/utils/db-queries/booking";
import { getGuides } from "@/utils/db-queries/guide";
import { getCountries } from "@/utils/db-queries/country";

export default async function GuideScreen() {
  const res = await Promise.all([getGuides(), getCountries()]);
  return (
    <div className="p-8">
      <WeeklyCalendar guides={res[0]} countries={res[1]} />
    </div>
  );
}
