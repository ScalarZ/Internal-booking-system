import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function ForPage({
  children,
  readonly,
  className,
  type = "single",
  page,
}: {
  children: React.ReactNode;
  className?: string;
  readonly?: boolean;
} & (
  | {
      type?: "single";
      page?: string;
    }
  | {
      type?: "multiple";
      page?: string[];
    }
)) {
  const pathname = usePathname();

  if (type === "single" && pathname === page) return children;

  if (type === "multiple" && page?.includes(pathname)) return children;

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
