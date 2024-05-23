"use client";
import { createClient } from "@/utils/supabase/client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectNotifications } from "@/drizzle/schema";

const supabase = createClient();

export default function Notifications({
  notifications,
}: {
  notifications: SelectNotifications[];
}) {
  const [notificationsList, setNotificationsList] = useState(notifications);
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
          console.log(payload);
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
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Bell className="text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-2 -translate-x-8">
          {notificationsList.length
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
