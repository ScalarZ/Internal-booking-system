import Logo from "@/public/promotravel-logo.png";
import Image from "next/image";
import { LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "@/auth";
import { Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Notifications from "./notifications";
import { db } from "@/drizzle/db";
import { notifications, SelectNotifications } from "@/drizzle/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export default async function Navbar({ session }: { session: Session | null }) {
  const headersList = headers();
  const referer = headersList.get("referer");
  const type =
    referer?.split("/").at(-1) === "bookings" ? "reservation" : "booking";
  let notificationsList: SelectNotifications[] = [];
  if (session)
    notificationsList = await db
      .select()
      .from(notifications)
      .where(eq(notifications.type, type));

  return (
    <nav
      className={cn("flex items-center justify-between bg-sky-900 p-4", {
        "justify-center": !session,
      })}
    >
      <Image src={Logo} alt="promotravel-logo" width={124} loading="eager" />
      <div className="flex items-center gap-x-4">
        {session ? (
          <div className="flex justify-center gap-x-4">
            <Notifications notifications={notificationsList} />
            <DropdownMenu>
              <DropdownMenuTrigger>
                {session.user?.image ? (
                  <Image
                    src={session.user?.image}
                    alt="promotravel-logo"
                    width={32}
                    height={32}
                    className="h-8 rounded-full"
                  />
                ) : (
                  <UserCircle2 size={32} />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="text-neutral-500">
                  {session.user?.email}
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button
                      type="submit"
                      className="flex items-center gap-x-1 font-medium text-red-500"
                    >
                      <LogOut size={18} /> Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <></>
        )}
      </div>
    </nav>
  );
}
