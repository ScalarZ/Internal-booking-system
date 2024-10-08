import { getToursWithBooking } from "@/utils/db-queries/tour";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/utils/get-query-provider";
import ToursBooking from "./components/tours-booking";
import { getBookingParams } from "@/lib/utils";

export default async function OrdersPage() {
  const [countries, companies, tours, nationalities, nileCruises] =
    await getBookingParams();
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
        />
      </div>
    </HydrationBoundary>
  );
}
