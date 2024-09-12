import { getCountries } from "@/utils/db-queries/country";
import { getCompanies } from "@/utils/db-queries/company";
import { getTours } from "@/utils/db-queries/tour";
import { getBookings } from "@/utils/db-queries/booking";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/utils/get-query-provider";
import { getNationalities } from "@/utils/db-queries/nationality";
import { getNileCruises } from "@/utils/db-queries/nile-cruise";
import Bookings from "../bookings/_components/bookings";

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
    queryKey: ["bookings"],
    queryFn: getBookings,
  });
  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="relative p-4">
        <Bookings
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
