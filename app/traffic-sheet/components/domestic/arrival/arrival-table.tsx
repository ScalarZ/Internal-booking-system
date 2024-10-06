"use client";

import useURLQuery from "@/hooks/use-url-query";
import { getDomesticArrivals } from "@/utils/db-queries/booking";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DataTable } from "../../data-table";
import { arrivalColumns } from "./arrival-columns";
import { useTraffic } from "../../traffic-context";

export default function DepartureTable() {
  const { buses, drivers, representatives } = useTraffic();
  const { params } = useURLQuery();
  const date = params.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const city = params.get("city");
  const { data: bookings } = useQuery({
    queryKey: ["domestic-arrival", date, city],
    queryFn: () => getDomesticArrivals(date, city ?? undefined),
  });
  return (
    <div className="flex flex-col gap-y-2">
      <h2 className="text-xl font-medium">Arrival Table</h2>
      {!!bookings && (
        <DataTable
          columns={arrivalColumns(representatives!, buses!, drivers!)}
          data={bookings!}
        />
      )}
    </div>
  );
}
