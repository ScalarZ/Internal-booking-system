import CreateActivityButton from "./_components/create-activity-button";
import Activities from "./_components/activities";
import { getActivities } from "@/utils/db-queries/activity";
import { getCountries } from "@/utils/db-queries/country";

export default async function ActivitiesPage() {
  try {
    const [activities, countries] = await Promise.all([
      getActivities(),
      getCountries(),
    ]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateActivityButton countriesList={countries} />
        </div>
        <Activities activities={activities} countries={countries} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching activities</p>;
  }
}
