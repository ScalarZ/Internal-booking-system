import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getRepresentatives } from "@/utils/db-queries/representatives";
import Departure from "./components/departure";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TrafficFilter from "./components/traffic-filter";
import { TrafficProvider } from "./components/traffic-context";
import { getBuses } from "@/utils/db-queries/buses";
import { getDrivers } from "@/utils/db-queries/drivers";
import { getCities } from "@/utils/db-queries/city";
export default async function TrafficSheetPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const [representatives, buses, drivers, cities] = await Promise.all([
    getRepresentatives(),
    getBuses(),
    getDrivers(),
    getCities(),
  ]);

  return (
    <TrafficProvider
      buses={buses}
      drivers={drivers}
      cities={cities}
      representatives={representatives}
    >
      <div className="flex flex-col gap-y-4 p-8">
        <TrafficFilter />
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center p-10">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          }
        >
          <Departure searchParams={searchParams} />
        </Suspense>
      </div>
    </TrafficProvider>
  );
}
