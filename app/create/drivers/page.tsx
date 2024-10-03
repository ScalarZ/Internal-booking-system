import CreateDriverButton from "../_components/create-button";
import { getDrivers } from "@/utils/db-queries/drivers";
import { getCountries } from "@/utils/db-queries/country";
import Drivers from "./_components/drivers";

export default async function DriversPage() {
  try {
    const [drivers, countries] = await Promise.all([
      getDrivers(),
      getCountries(),
    ]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateDriverButton countriesList={countries} type="driver" />
        </div>
        <Drivers drivers={drivers} countries={countries} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return <p className="p-24">Error fetching drivers</p>;
  }
}
