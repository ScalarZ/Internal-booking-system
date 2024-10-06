import { getDomesticArrivals } from "@/utils/db-queries/booking";
import getQueryClient from "@/utils/get-query-provider";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { format } from "date-fns";
import ArrivalTable from "./arrival-table";

export default async function DomesticArrival({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const date = searchParams.date ?? format(new Date(), "yyyy-MM-dd");
  const city = searchParams.city;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["domestic-arrival", date, city],
    queryFn: () => getDomesticArrivals(date, city),
  });

  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <ArrivalTable />
    </HydrationBoundary>
  );
}
