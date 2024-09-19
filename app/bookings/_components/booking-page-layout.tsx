import { filterBookings, getBookings } from "@/utils/db-queries/booking";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/utils/get-query-provider";
import { getBookingParams, getFilter } from "@/lib/utils";
import Bookings from "./bookings";

export async function BookingPageLayout({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const filter = getFilter(searchParams);
  const [countries, companies, tours, nationalities, nileCruises] =
    await getBookingParams();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["bookings"],
    queryFn: !filter ? getBookings : () => filterBookings(filter),
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
          filter={filter}
        />
      </div>
    </HydrationBoundary>
  );
}
