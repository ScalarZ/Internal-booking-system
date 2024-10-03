import { getTrafficSheetDepartures } from "@/utils/db-queries/booking";
import getQueryClient from "@/utils/get-query-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { format } from "date-fns";
import DepartureTable from "./departure-table";

export default async function Departure({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const date = searchParams.date ?? format(new Date(), "yyyy-MM-dd");
  const city = searchParams.city;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["traffic-sheet", date, city],
    queryFn: () => getTrafficSheetDepartures(date, city),
  });

  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <DepartureTable />
    </HydrationBoundary>
  );
}
