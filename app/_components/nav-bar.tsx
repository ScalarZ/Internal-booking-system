import Logo from "@/public/promotravel-logo.png";
import Image from "next/image";
import { LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "@/auth";
import { Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <nav
      className={cn("flex items-center justify-between bg-sky-900 p-4", {
        "justify-center": !session,
      })}
    >
      <Image src={Logo} alt="promotravel-logo" width={124} loading="eager" />
      <div>
        {session ? (
          <div className="flex justify-center gap-x-4">
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
