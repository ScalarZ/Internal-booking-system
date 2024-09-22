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
import { cn, getAviationRowStatus, getReservationRowStatus } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pathname?: string;
  onRowClick?: (
    row: Bookings & { optionalTour?: SelectBookingOptionalTours },
  ) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pathname,
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
                    (pathname === "/reservations" &&
                      !!row.original &&
                      getReservationRowStatus(
                        (row.original as unknown as Bookings).reservations,
                      ) === "success") ||
                    (pathname === "/aviations" &&
                      !!row.original &&
                      getAviationRowStatus(
                        (row.original as unknown as Bookings).domesticFlights,
                      ) === "success"),
                  "bg-yellow-100":
                    (pathname === "/reservations" &&
                      !!row.original &&
                      getReservationRowStatus(
                        (row.original as unknown as Bookings).reservations,
                      ) === "warning") ||
                    (pathname === "/aviations" &&
                      !!row.original &&
                      getAviationRowStatus(
                        (row.original as unknown as Bookings).domesticFlights,
                      ) === "warning"),
                  "bg-red-100":
                    (pathname === "/reservations" &&
                      !!row.original &&
                      getReservationRowStatus(
                        (row.original as unknown as Bookings).reservations,
                      ) === "danger") ||
                    (pathname === "/aviations" &&
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
