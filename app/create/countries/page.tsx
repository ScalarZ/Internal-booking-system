import CreateCountryButton from "./_components/create-country-button";
import Countries from "./_components/countries";
import { getCountries } from "@/utils/db-queries/country";

export default async function CountriesPage() {
  try {
    const countries = await getCountries();
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateCountryButton />
        </div>
        <Countries countries={countries!} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching countries</p>;
  }
}
