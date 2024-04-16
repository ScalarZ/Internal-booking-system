"use client";
import { cn } from "@/lib/utils";
import { BookPlusIcon, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <ul className="fixed flex h-full flex-col gap-y-4 bg-sky-900 p-4">
      <li
        className={cn(
          "flex items-center gap-x-2 rounded bg-white px-8 py-1.5 font-medium text-black",
          {
            "bg-yellow-400 text-black": pathname.includes("/create"),
          },
        )}
      >
        <Plus size={18} />
        <Link href="/create">Create</Link>
      </li>
      <li
        className={cn(
          "flex items-center gap-x-2 rounded bg-white px-8 py-1.5 font-medium text-black",
          {
            "bg-yellow-400 text-black": pathname.includes("/bookings"),
          },
        )}
      >
        <BookPlusIcon size={18} />
        <Link href="/bookings">Bookings</Link>
      </li>
    </ul>
  );
}
