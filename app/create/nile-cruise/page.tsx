import { getNileCruises } from "@/utils/db-queries/nile-cruise";
import CreateCountryButton from "./_components/create-cruise-button";
import Cruises from "./_components/cruises";

export default async function CruisesPage() {
  try {
    const nileCruises = await getNileCruises();
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateCountryButton />
        </div>
        <Cruises nileCruises={nileCruises!} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching countries</p>;
  }
}
