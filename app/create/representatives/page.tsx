import { getRepresentatives } from "@/utils/db-queries/representatives";
import CreateRepresentativeButton from "../_components/create-button";
import Cities from "./_components/representatives";
import { getCountries } from "@/utils/db-queries/country";

export default async function RepresentativesPage() {
  try {
    const [representatives, countries] = await Promise.all([
      getRepresentatives(),
      getCountries(),
    ]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateRepresentativeButton
            countriesList={countries}
            type="representative"
          />
        </div>
        <Cities cities={representatives} countries={countries} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching representatives</p>;
  }
}
