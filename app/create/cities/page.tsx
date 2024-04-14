import CreateCityButton from "../_components/create-button";
import Cities from "./_components/cities";
import { getCities } from "@/utils/db-queries/city";
import { getCountries } from "@/utils/db-queries/country";

export default async function CitiesPage() {
  try {
    const [cities, countries] = await Promise.all([
      getCities(),
      getCountries(),
    ]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateCityButton countriesList={countries} type="city" />
        </div>
        <Cities cities={cities} countries={countries} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching cities</p>;
  }
}
