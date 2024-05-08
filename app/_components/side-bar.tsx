"use client";
import { cn } from "@/lib/utils";
import { BookPlusIcon, Hotel, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <ul className="fixed flex h-full flex-col gap-y-4 bg-sky-900 p-4 z-50">
      <li>
        <Link
          href="/create"
          className={cn(
            "flex items-center gap-x-2 rounded bg-white px-8 py-1.5 font-medium text-black",
            {
              "bg-yellow-400 text-black": pathname.includes("/create"),
            },
          )}
        >
          <Plus size={18} />
          Create
        </Link>
      </li>
      <li>
        <Link
          href="/bookings"
          className={cn(
            "flex items-center gap-x-2 rounded bg-white px-8 py-1.5 font-medium text-black",
            {
              "bg-yellow-400 text-black": pathname.includes("/bookings"),
            },
          )}
        >
          <BookPlusIcon size={18} />
          Bookings
        </Link>
      </li>
      <li>
        <Link
          href="/reservations"
          className={cn(
            "flex items-center gap-x-2 rounded bg-white px-8 py-1.5 font-medium text-black",
            {
              "bg-yellow-400 text-black": pathname.includes("/reservations"),
            },
          )}
        >
          <Hotel size={18} />
          Reservations
        </Link>
      </li>
    </ul>
  );
}
