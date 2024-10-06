"use client";

import useURLQuery from "@/hooks/use-url-query";
import { getDomesticDepartures } from "@/utils/db-queries/booking";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DataTable } from "../../data-table";
import { departureColumns } from "./departure-columns";
import { useTraffic } from "../../traffic-context";

export default function DepartureTable() {
  const { buses, drivers, representatives } = useTraffic();
  const { params } = useURLQuery();
  const date = params.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const city = params.get("city");
  const { data: bookings } = useQuery({
    queryKey: ["domestic-departure", date, city],
    queryFn: () => getDomesticDepartures(date, city ?? undefined),
  });
  return (
    <div className="flex flex-col gap-y-2">
      <h2 className="text-xl font-medium">Departure Table</h2>
      {!!bookings && (
        <DataTable
          columns={departureColumns(representatives!, buses!, drivers!)}
          data={bookings!}
        />
      )}
    </div>
  );
}
