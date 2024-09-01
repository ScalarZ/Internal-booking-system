import Tours from "./_components/tours";
import { getTours } from "@/utils/db-queries/tour";
import { getCountries } from "@/utils/db-queries/country";
import CreateTour from "./_components/create-tour";

export default async function ToursPage() {
  try {
    const [tours, countries] = await Promise.all([getTours(), getCountries()]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateTour countriesList={countries} />
        </div>
        <Tours tours={tours} countries={countries} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching tours</p>;
  }
}
