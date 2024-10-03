import CreateBusButton from "../_components/create-button";
import Buses from "./_components/buses";
import { getBuses } from "@/utils/db-queries/buses";
import { getCountries } from "@/utils/db-queries/country";

export default async function BusesPage() {
  try {
    const [buses, countries] = await Promise.all([getBuses(), getCountries()]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateBusButton countriesList={countries} type="bus" />
        </div>
        <Buses buses={buses} countries={countries} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return <p className="p-24">Error fetching buses</p>;
  }
}
