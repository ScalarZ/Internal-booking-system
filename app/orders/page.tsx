import { getCountries } from "@/utils/db-queries/country";
import { getCompanies } from "@/utils/db-queries/company";
import { getTours, getToursWithBooking } from "@/utils/db-queries/tour";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/utils/get-query-provider";
import { getNationalities } from "@/utils/db-queries/nationality";
import { getNileCruises } from "@/utils/db-queries/nile-cruise";
import ToursBooking from "./components/tours-booking";

export default async function BookingPage() {
  const [countries, companies, tours, nationalities, nileCruises] =
    await Promise.all([
      getCountries(),
      getCompanies(),
      getTours(),
      getNationalities(),
      getNileCruises(),
    ]);
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["orders"],
    queryFn: getToursWithBooking,
  });
  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="relative p-4">
        <ToursBooking
          nileCruises={nileCruises}
          countries={countries}
          companies={companies}
          tours={tours}
          nationalities={nationalities}
          type="booking"
        />
      </div>
    </HydrationBoundary>
  );
}
