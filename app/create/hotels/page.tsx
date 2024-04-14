import CreateHotelButton from "./_components/create-hotel-button";
import Hotels from "./_components/hotels";
import { getHotels } from "@/utils/db-queries/hotel";
import { getCountries } from "@/utils/db-queries/country";

export default async function ActivitiesPage() {
  try {
    const [hotels, countries] = await Promise.all([
      getHotels(),
      getCountries(),
    ]);
    return (
      <div>
        <div className="flex w-full justify-end">
          <CreateHotelButton countriesList={countries} />
        </div>
        <Hotels hotels={hotels} countries={countries} />
      </div>
    );
  } catch (error) {
    return <p className="p-24">Error fetching hotels</p>;
  }
}
