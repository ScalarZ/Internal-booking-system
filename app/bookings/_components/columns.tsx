"use client";

import { Bookings } from "@/drizzle/schema";
import { cn, getAviationRowStatus, getReservationRowStatus } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Trash, X } from "lucide-react";

export function columns({
  setBooking,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  pathname,
}: {
  pathname?: string;
  setBooking: (initialValues: Bookings | undefined) => void;
  setIsEditModalOpen: (value: boolean) => void;
  setIsDeleteModalOpen: (value: boolean) => void;
}): ColumnDef<Bookings>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.status ? (
          <Check className="text-green-500" />
        ) : (
          <X className="text-red-500" />
        ),
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "countries",
      header: "Countries",
      cell: ({ row }) => (
        <ul className="flex gap-x-1 text-white">
          {row.original.countries?.map((name, i) => (
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
      accessorKey: "currency",
      header: "Currency",
    },
    {
      accessorKey: "arrivalDate",
      header: "Arrival date",
      cell: ({ row }) =>
        row.original.arrivalDate
          ? format(row.original.arrivalDate, "dd/MM/yyyy")
          : null,
    },
    {
      accessorKey: "departureDate",
      header: "Departure date",
      cell: ({ row }) =>
        row.original.departureDate
          ? format(row.original.departureDate, "dd/MM/yyyy")
          : null,
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
          {row.original.bookingHotels?.map(({ hotel }, i) => (
            <li
              key={i}
              className="flex items-center gap-x-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold"
            >
              {hotel.name}
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
      cell: ({ row }) => row.original.bookingTour?.name,
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
      accessorKey: "internalFlights",
      header: "Internal flights",
      cell: ({ row }) =>
        row.original.internalFlights ? (
          <Check className="text-green-500" />
        ) : (
          <X className="text-red-500" />
        ),
    },
    {
      accessorKey: "flightsGeneralNote",
      header: "Flights general note",
      cell: ({ row }) => (
        <p className="w-28 overflow-hidden text-ellipsis whitespace-nowrap">
          {row.original.flightsGeneralNote}
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
      accessorKey: "reservations",
      header: "Reservations",
      cell: ({ row }) => (
        <div
          className={cn("size-3 rounded-full", {
            "bg-green-500":
              getReservationRowStatus(row.original.reservations) === "success",
            "bg-yellow-500":
              getReservationRowStatus(row.original.reservations) === "warning",
            "bg-red-500":
              getReservationRowStatus(row.original.reservations) === "danger",
          })}
        />
      ),
    },
    {
      accessorKey: "domesticFlights",
      header: "Aviations",
      cell: ({ row }) => (
        <div
          className={cn("size-3 rounded-full", {
            "bg-green-500":
              getAviationRowStatus(row.original.domesticFlights) === "success",
            "bg-yellow-500":
              getAviationRowStatus(row.original.domesticFlights) === "warning",
            "bg-red-500":
              getAviationRowStatus(row.original.domesticFlights) === "danger",
          })}
        />
      ),
    },
    pathname === "/bookings"
      ? {
          accessorKey: "action",
          header: "Action",
          cell: ({ row }) => {
            return (
              <Trash
                size={20}
                className="cursor-pointer text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setBooking(row.original);
                  setIsDeleteModalOpen(true);
                  setIsEditModalOpen(false);
                }}
              />
            );
          },
        }
      : {
          accessorKey: " ",
          header: " ",
        },
  ];
}
