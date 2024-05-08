import { SelectHotels } from "@/drizzle/schema";
import { getCityHotels } from "./db-queries/hotel";

export async function listCityHotels({
  countryId,
  cityId,
  setHotelsList,
}: {
  countryId: string;
  cityId: string;
  setHotelsList: (hotels: SelectHotels[]) => void;
}) {
  setHotelsList([]);
  try {
    const res = await getCityHotels({ countryId, cityId });
    setHotelsList(res);
  } catch (err) {
    console.error(err);
  }
}
