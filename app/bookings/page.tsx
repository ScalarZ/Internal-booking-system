import { getCountries } from "@/utils/db-queries/country";
import Bookings from "./_components/bookings";
import { getCompanies } from "@/utils/db-queries/company";
import { getTours } from "@/utils/db-queries/tour";
import { getBookings } from "@/utils/db-queries/booking";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/utils/get-query-provider";
import { getNationalities } from "@/utils/db-queries/nationality";
import { getNileCruises } from "@/utils/db-queries/nile-cruise";
import CreateBooking from "./_components/create-booking";

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
        <CreateBooking
          nileCruises={nileCruises}
          companies={companies}
          nationalities={nationalities}
          tours={tours}
        />
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
