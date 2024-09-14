import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function ForSearchScreen({
  children,
  readonly,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  readonly?: boolean;
}) {
  const pathname = usePathname();

  if (pathname === "/search-screen") return children;

  if (readonly)
    return (
      <div
        className={cn(className, {
          "pointer-events-none cursor-not-allowed opacity-50": readonly,
        })}
      >
        {children}
      </div>
    );

  return null;
}
