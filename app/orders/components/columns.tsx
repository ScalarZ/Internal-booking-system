import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

export type Columns = {
  internalBookingId: string;
  company: string;
  pax: number;
  optionalTour: {
    done: boolean;
    createdAt: Date;
  };
};

export function columns(): ColumnDef<Columns>[] {
  return [
    {
      accessorKey: "optionalTour.createdAt",
      header: "Entry date",
      cell: ({ row }) => format(row.original.optionalTour.createdAt, "PPP"),
    },
    {
      accessorKey: "internalBookingId",
      header: "Internal booking ID",
    },
    {
      accessorKey: "company",
      header: "Company",
    },

    {
      accessorKey: "pax",
      header: "PAX",
    },
    {
      accessorKey: "optionalTour.done",
      header: "Done",
      cell: ({ row }) =>
        row.original.optionalTour.done ? (
          <Check className="text-green-500" />
        ) : (
          <X className="text-red-500" />
        ),
    },
  ];
}
