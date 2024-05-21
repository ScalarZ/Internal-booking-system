import { SelectCities } from "@/drizzle/schema";
import { getCountryCities } from "./db-queries/city";

export async function listCountryCities({
  countryId,
  setCitiesList,
}: {
  countryId: string;
  setCitiesList: (countries: SelectCities[]) => void;
}) {
  setCitiesList([]);
  try {
    const res = await getCountryCities(countryId);
    setCitiesList(res);
  } catch (err) {
    console.error(err);
  }
}
