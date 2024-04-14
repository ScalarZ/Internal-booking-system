import { getNationalities } from "@/utils/db-queries/nationality";
import Nationalities from "./_components/nationalities";
import CreateNationalityButton from "./_components/create-nationality-button";

export default async function NationalitiesPage() {
  try {
    const nationalities = await getNationalities();
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateNationalityButton />
        </div>
        <Nationalities nationalities={nationalities!} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching nationalities</p>;
  }
}
