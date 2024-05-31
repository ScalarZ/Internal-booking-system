"use client";
import { createClient } from "@/utils/supabase/client";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectNotifications } from "@/drizzle/schema";
import { usePathname } from "next/navigation";
import { getNotifications } from "@/utils/db-queries/notification";

const supabase = createClient();

export default function Notifications() {
  const [notificationsList, setNotificationsList] = useState<
    SelectNotifications[]
  >([]);
  const pathname = usePathname();
  const listNotifications = useCallback(
    async (pathname: "booking" | "reservation") => {
      try {
        const notifications = await getNotifications(pathname);
        setNotificationsList(notifications);
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );
  useEffect(() => {
    const channel = supabase
      .channel("realtime notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotificationsList((prev) => [
            ...prev,
            payload?.new as SelectNotifications,
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (pathname === "/reservations") {
      listNotifications("booking");
    } else {
      listNotifications("reservation");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Bell className="text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="-translate-x-8 p-2">
          {notificationsList?.length
            ? notificationsList.map(({ id, message }) => (
                <DropdownMenuItem key={id} className="text-neutral-500">
                  {message}
                </DropdownMenuItem>
              ))
            : "No notifications"}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
