"use client";

import {
  ColumnDef,
  Row,
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
  SelectBookingWithReservations,
  SelectReservations,
} from "@/drizzle/schema";
import { cn } from "@/lib/utils";

function getRowStatus(reservations?: SelectReservations[]) {
  if (reservations?.every((reservation) => reservation.finalPrice))
    return "success";
  if (reservations?.some((reservation) => reservation.finalPrice))
    return "warning";
  return "danger";
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isReservation?: boolean;
  onRowClick?: (row: SelectBookingWithReservations) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isReservation,
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
                onClick={() =>
                  onRowClick?.(row.original as SelectBookingWithReservations)
                }
                className={cn("bg-white", {
                  "bg-green-100":
                    isReservation &&
                    !!row.original &&
                    getRowStatus(
                      (row.original as unknown as SelectBookingWithReservations)
                        .reservations,
                    ) === "success",
                  "bg-yellow-100":
                    isReservation &&
                    !!row.original &&
                    getRowStatus(
                      (row.original as unknown as SelectBookingWithReservations)
                        .reservations,
                    ) === "warning",
                  "bg-red-100":
                    isReservation &&
                    !!row.original &&
                    getRowStatus(
                      (row.original as unknown as SelectBookingWithReservations)
                        .reservations,
                    ) === "danger",
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
