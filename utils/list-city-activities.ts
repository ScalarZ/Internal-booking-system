import { SelectActivities } from "@/drizzle/schema";
import { getCityActivities } from "./db-queries/activity";

export async function listCityActivities({
  countryId,
  cityId,
  setActivitiesList,
}: {
  countryId: string;
  cityId: string;
  setActivitiesList: (activities: SelectActivities[]) => void;
}) {
  setActivitiesList([]);
  try {
    const res = await getCityActivities({ countryId, cityId });
    setActivitiesList(res.data!);
  } catch (err) {
    console.error(err);
  }
}
