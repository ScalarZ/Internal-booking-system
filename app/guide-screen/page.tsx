import React from "react";
import WeeklyCalendar from "./_components/weekly-calendar";
import { getGuides } from "@/utils/db-queries/guide";
import { getCountries } from "@/utils/db-queries/country";
import { getCities } from "@/utils/db-queries/city";
import { getActivities } from "@/utils/db-queries/activity";

export default async function GuideScreen() {
  const [guides, countries, cities, activities] = await Promise.all([
    getGuides(),
    getCountries(),
    getCities(),
    getActivities(),
  ]);
  return (
    <div className="p-8">
      <WeeklyCalendar
        guides={guides}
        countries={countries}
        cities={cities}
        activities={activities}
      />
    </div>
  );
}
