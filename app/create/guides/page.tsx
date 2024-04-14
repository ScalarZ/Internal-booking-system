import CreateCityButton from "../_components/create-button";
import { getCountries } from "@/utils/db-queries/country";
import Guides from "./_components/guides";
import { getGuides } from "@/utils/db-queries/guide";

export default async function CitiesPage() {
  try {
    const [guides, countries] = await Promise.all([
      getGuides(),
      getCountries(),
    ]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateCityButton countriesList={countries} type="guide" />
        </div>
        <Guides guides={guides} countries={countries} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching cities</p>;
  }
}
