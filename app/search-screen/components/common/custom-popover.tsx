import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
export default function CostumePopover({
  disabled,
  title,
  children,
  icon,
  triggerWrapper,
}: {
  disabled: boolean;
  title: string | string[] | React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  triggerWrapper?: React.ElementType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const TriggerWrapper = triggerWrapper || "div";
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <TriggerWrapper>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between overflow-auto whitespace-pre-wrap text-left"
          >
            {title}
            {icon}
          </Button>
        </TriggerWrapper>
      </PopoverTrigger>

      <PopoverContent className="p-0">{children}</PopoverContent>
    </Popover>
  );
}
