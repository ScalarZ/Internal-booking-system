import React from "react";
import WeeklyCalendar from "./_components/weekly-calendar";
import { getWeeklyItineraries } from "@/utils/db-queries/booking";
import { getGuides } from "@/utils/db-queries/guide";

export default async function GuideScreen() {
  const guides = await getGuides();
  return (
    <div className="p-8">
      <WeeklyCalendar guides={guides} />
    </div>
  );
}
