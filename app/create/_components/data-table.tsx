"use client";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  Bookings,
  SelectBookingOptionalTours,
  SelectReservations,
} from "@/drizzle/schema";
import { cn } from "@/lib/utils";

function getReservationRowStatus(reservations?: SelectReservations[]) {
  if (reservations?.every((reservation) => reservation.finalPrice))
    return "success";
  if (reservations?.some((reservation) => reservation.finalPrice))
    return "warning";
  return "danger";
}

function getAviationRowStatus(
  domesticFlights?: Omit<ArrivalDeparturePair<DomesticFlight>[], "file"> | null,
) {
  if (domesticFlights?.some(({ arrival, departure }) => !arrival || !departure))
    return "danger";
  if (
    domesticFlights?.every(
      ({ arrival, departure }) =>
        Object.values(arrival).every((value) => !!value) &&
        Object.values(departure).every((value) => !!value),
    )
  )
    return "success";
  if (
    domesticFlights?.every(
      ({
        arrival: { issued: arrivalIssued, ...arrivalProps },
        departure: { issued: departureIssued, ...departureProps },
      }) =>
        Object.values(arrivalProps).some(
          (value) => !!value && !arrivalIssued,
        ) ||
        (Object.values(departureProps).some((value) => !!value) &&
          !!departureIssued),
    )
  )
    return "warning";
  return "danger";
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  type?: "booking" | "reservation" | "aviation";
  onRowClick?: (
    row: Bookings & { optionalTour?: SelectBookingOptionalTours },
  ) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  type,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups()?.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers?.map((header) => {
                return (
                  <TableHead key={header.id} className="w-36 whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows?.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(row.original as Bookings)}
                className={cn("bg-white", {
                  "bg-green-100":
                    (type === "reservation" &&
                      !!row.original &&
                      getReservationRowStatus(
                        (row.original as unknown as Bookings).reservations,
                      ) === "success") ||
                    (type === "aviation" &&
                      !!row.original &&
                      getAviationRowStatus(
                        (row.original as unknown as Bookings).domesticFlights,
                      ) === "success"),
                  "bg-yellow-100":
                    (type === "reservation" &&
                      !!row.original &&
                      getReservationRowStatus(
                        (row.original as unknown as Bookings).reservations,
                      ) === "warning") ||
                    (type === "aviation" &&
                      !!row.original &&
                      getAviationRowStatus(
                        (row.original as unknown as Bookings).domesticFlights,
                      ) === "warning"),
                  "bg-red-100":
                    (type === "reservation" &&
                      !!row.original &&
                      getReservationRowStatus(
                        (row.original as unknown as Bookings).reservations,
                      ) === "danger") ||
                    (type === "aviation" &&
                      !!row.original &&
                      getAviationRowStatus(
                        (row.original as unknown as Bookings).domesticFlights,
                      ) === "danger"),
                })}
              >
                {row.getVisibleCells()?.map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
