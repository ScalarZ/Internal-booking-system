"use client";

import { Button } from "@/components/ui/button";
import { SelectNileCruises } from "@/drizzle/schema";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";

export function columns({
  setInitialValues,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
}: {
  setInitialValues: (country: SelectNileCruises) => void;
  setIsEditModalOpen: (value: boolean) => void;
  setIsDeleteModalOpen: (value: boolean) => void;
}): ColumnDef<SelectNileCruises>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
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
