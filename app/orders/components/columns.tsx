import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

export type Columns = {
  internalBookingId: string;
  optionalTour: {
    done: boolean;
  };
};

export function columns(): ColumnDef<Columns>[] {
  return [
    {
      accessorKey: "internalBookingId",
      header: "Internal booking ID",
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
