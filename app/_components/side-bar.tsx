"use client";
import { cn } from "@/lib/utils";
import { BookPlusIcon, Hotel, Plane, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const list = [
  { name: "Create", link: "/create", icon: <Plus size={18} /> },
  { name: "Bookings", link: "/bookings", icon: <BookPlusIcon size={18} /> },
  { name: "Reservations", link: "/reservations", icon: <Hotel size={18} /> },
  { name: "Aviations", link: "/aviations", icon: <Plane size={18} /> },
];
export default function SideBar() {
  const pathname = usePathname();

  return (
    <ul className="fixed z-50 flex h-full flex-col gap-y-4 bg-sky-900 p-4">
      {list.map(({ name, link, icon }) => (
        <Link key={name} href={link}>
          <li
            className={cn(
              "flex items-center gap-x-2 rounded bg-white px-8 py-1.5 font-medium text-black",
              {
                "bg-yellow-400 text-black": pathname === link,
              },
            )}
          >
            {icon}
            {name}
          </li>
        </Link>
      ))}
    </ul>
  );
}
