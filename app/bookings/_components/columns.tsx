"use client";

import { SelectBookings } from "@/drizzle/schema";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Edit, Trash, X } from "lucide-react";

export function columns({
  setInitialValues,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
}: {
  setInitialValues: (initialValues: SelectBookings | null) => void;
  setIsEditModalOpen: (value: boolean) => void;
  setIsDeleteModalOpen: (value: boolean) => void;
}): ColumnDef<SelectBookings>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "guide",
      header: "Guide",
    },
    {
      accessorKey: "currency",
      header: "Currency",
    },
    {
      accessorKey: "arrivalDate",
      header: "Arrival date",
      cell: ({ row }) => format(row.original.arrivalDate!, "dd/MM/yyyy"),
    },
    {
      accessorKey: "departureDate",
      header: "Departure date",
      cell: ({ row }) => format(row.original.departureDate!, "dd/MM/yyyy"),
    },
    {
      accessorKey: "single",
      header: "Single room",
    },
    {
      accessorKey: "double",
      header: "Double room",
    },
    {
      accessorKey: "triple",
      header: "Triple room",
    },
    {
      accessorKey: "roomNote",
      header: "Room note",
      cell: ({ row }) => (
        <p className="w-28 overflow-hidden text-ellipsis whitespace-nowrap">
          {row.original.roomNote}
        </p>
      ),
    },
    {
      accessorKey: "hotels",
      header: "Hotels",
      cell: ({ row }) => (
        <ul className="flex gap-x-1 text-white">
          {row.original.hotels?.map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-x-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold"
            >
              {name}
            </li>
          ))}
        </ul>
      ),
    },
    {
      accessorKey: "internalBookingId",
      header: "Internal booking ID",
    },
    {
      accessorKey: "activities",
      header: "Activities",
      cell: ({ row }) => (
        <ul className="flex gap-x-1 text-white">
          {row.original.activities?.map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-x-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold"
            >
              {name}
            </li>
          ))}
        </ul>
      ),
    },
    {
      accessorKey: "referenceBookingId",
      header: "Reference booking ID",
    },
    {
      accessorKey: "language",
      header: "Language",
    },
    {
      accessorKey: "nationality",
      header: "Nationality",
    },
    {
      accessorKey: "pax",
      header: "PAX",
    },
    {
      accessorKey: "tourists",
      header: "Tourists",
      cell: ({ row }) => (
        <ul className="flex gap-x-1 text-white">
          {row.original.tourists?.map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-x-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold"
            >
              {name}
            </li>
          ))}
        </ul>
      ),
    },

    {
      accessorKey: "tour",
      header: "Tour",
    },
    {
      accessorKey: "visa",
      header: "Visa",
      cell: ({ row }) =>
        row.original.visa ? (
          <Check className="text-green-500" />
        ) : (
          <X className="text-red-500" />
        ),
    },
    {
      accessorKey: "tips",
      header: "Tips",
    },
    {
      accessorKey: "InternalFlights",
      header: "Internal flights",
      cell: ({ row }) =>
        row.original.internalFlights ? (
          <Check className="text-green-500" />
        ) : (
          <X className="text-red-500" />
        ),
    },
    {
      accessorKey: "InternalFlightsNote",
      header: "Internal flights note",
      cell: ({ row }) => (
        <p className="w-28 overflow-hidden text-ellipsis whitespace-nowrap">
          {row.original.internalFlightsNote}
        </p>
      ),
    },
    {
      accessorKey: "generalNote",
      header: "General note",
      cell: ({ row }) => (
        <p className="w-28 overflow-hidden text-ellipsis whitespace-nowrap">
          {row.original.generalNote}
        </p>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created at",
      cell: ({ row }) => format(row.original.createdAt!, "dd/MM/yyyy"),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated at",
      cell: ({ row }) => format(row.original.updatedAt!, "dd/MM/yyyy"),
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex max-w-max gap-x-2">
            <Edit
              size={20}
              className="cursor-pointer text-neutral-600"
              onClick={() => {
                setInitialValues(row.original);
                setIsEditModalOpen(true);
                setIsDeleteModalOpen(false);
              }}
            />
            <Trash
              size={20}
              className="cursor-pointer text-red-500"
              onClick={() => {
                setInitialValues(row.original);
                setIsDeleteModalOpen(true);
                setIsEditModalOpen(false);
              }}
            />
          </div>
        );
      },
    },
  ];
}
