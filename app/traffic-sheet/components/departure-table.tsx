"use client";

import useURLQuery from "@/hooks/use-url-query";
import { getTrafficSheetDepartures } from "@/utils/db-queries/booking";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getRepresentatives } from "@/utils/db-queries/representatives";
import { getBuses } from "@/utils/db-queries/buses";
import { getDrivers } from "@/utils/db-queries/drivers";
import { useTraffic } from "./traffic-context";

export default function DepartureTable() {
  const { buses, drivers, representatives } = useTraffic();
  const { params } = useURLQuery();
  const date = params.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const city = params.get("city");
  const { data: bookings } = useQuery({
    queryKey: ["traffic-sheet", date, city],
    queryFn: () => getTrafficSheetDepartures(date, city ?? undefined),
  });
  console.log("render");
  return (
    <div className="flex flex-col gap-y-2">
      <h1 className="text-xl font-medium">Departure Table</h1>
      {!!bookings && (
        <DataTable
          columns={columns(representatives!, buses!, drivers!)}
          data={bookings!}
        />
      )}
    </div>
  );
}
