import { SelectGuides } from "@/drizzle/schema";
import { getCountryGuides } from "./db-queries/guide";

export async function listCountryGuides({
  countryId,
  setGuidesList,
}: {
  countryId: string;
  setGuidesList: (countries: SelectGuides[]) => void;
}) {
  setGuidesList([]);
  try {
    const res = await getCountryGuides(countryId);
    setGuidesList(res.data!);
  } catch (err) {
    console.error(err);
  }
}
