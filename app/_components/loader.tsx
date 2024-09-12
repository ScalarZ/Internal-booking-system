import { cn } from "@/lib/utils";
import { Loader as LoaderIcon, LucideProps } from "lucide-react";

export function Loader({
  className,
  ...props
}: { className?: string } & LucideProps) {
  return <LoaderIcon {...props} className={cn("animate-spin", className)} />;
}
