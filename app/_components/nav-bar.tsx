import Logo from "@/public/promotravel-logo.png";
import Image from "next/image";
import { LogOut, UserCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Notifications from "./notifications";
import { User } from "@supabase/supabase-js";

export default async function Navbar({ user }: { user: User | null }) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between bg-sky-900 p-4",
        {
          "justify-center": !user,
        },
      )}
    >
      <Image src={Logo} alt="promotravel-logo" width={124} loading="eager" />
      <div className="flex items-center gap-x-4">
        {user ? (
          <div className="flex justify-center gap-x-4">
            <Notifications />
            <DropdownMenu>
              <DropdownMenuTrigger>
                {user.user_metadata?.picture ? (
                  <Image
                    src={user.user_metadata?.picture}
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
                  {user.email}
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <form action="/api/auth/signout" method="post">
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
