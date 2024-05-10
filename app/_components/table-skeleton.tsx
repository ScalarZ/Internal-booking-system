"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { DataTable } from "../create/_components/data-table";

const columns = [
  {
    accessorKey: "id",
    header: () => <Skeleton className="h-4 w-44" />,
    cell: () => <Skeleton className="h-4 w-44" />,
  },
  {
    accessorKey: "country",
    header: () => <Skeleton className="h-4 w-44" />,
    cell: () => <Skeleton className="h-4 w-44" />,
  },
  {
    accessorKey: "city",
    header: () => <Skeleton className="h-4 w-44" />,
    cell: () => <Skeleton className="h-4 w-44" />,
  },
  {
    accessorKey: "tour",
    header: () => <Skeleton className="h-4 w-44" />,
    cell: () => <Skeleton className="h-4 w-44" />,
  },
];

export default function TableSkeleton() {
  return (
    <DataTable
      columns={columns}
      data={Array(10)?.map((_, i) => {
        id: i;
        country: `Country ${i}`;
        city: `City ${i}`;
        tour: `Tour ${i}`;
      })}
    />
  );
}
