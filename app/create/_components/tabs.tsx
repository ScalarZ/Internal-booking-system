"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const list = [
  { name: "Countries", link: "/create/countries" },
  { name: "Nationalities", link: "/create/nationalities" },
  { name: "Guides", link: "/create/guides" },
  { name: "Cities", link: "/create/cities" },
  { name: "Nile cruise", link: "/create/nile-cruise" },
  { name: "Activities", link: "/create/activities" },
  { name: "Tours", link: "/create/tours" },
  { name: "Companies", link: "/create/companies" },
  { name: "Hotels", link: "/create/hotels" },
  { name: "Representatives", link: "/create/representatives" },
];

export default function Tabs() {
  const pathname = usePathname();
  return (
    <ul className="absolute top-4 flex min-w-max rounded border border-neutral-200 p-1">
      {list?.map(({ name, link }) => (
        <Link key={name} href={link}>
          <li
            className={cn("w-36 cursor-pointer rounded px-2 py-1 text-center", {
              "bg-sky-900 text-white": pathname === link,
            })}
          >
            {name}
          </li>
        </Link>
      ))}
    </ul>
  );
}
