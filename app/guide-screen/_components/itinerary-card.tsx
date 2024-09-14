import { SelectBookingItineraries } from "@/drizzle/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBookingItineraryGuide } from "@/utils/db-queries/booking";

export default function ItineraryCard({
  id,
  day,
  cities,
  activities,
  optionalActivities,
  guide,
  i,
  guides,
}: SelectBookingItineraries & { i: number } & {
  guides: SelectGuidesWithCountries[];
}) {
  return (
    <div
      className="flex w-full max-w-[293px] grow flex-col gap-y-1 overflow-auto border p-2"
      key={id}
    >
      <span className="font-medium">Day {i + 1}</span>
      <span className="text-sm">{day}</span>
      <div className="flex items-start gap-x-2 text-sm">
        <span className="font-medium">Cities:</span>
        <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
          {cities?.map(({ id, name }) => (
            <li
              key={id}
              className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-start gap-x-2 text-sm">
        <span className="font-medium">Activities:</span>
        <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
          {activities?.map(({ id, name }) => (
            <li
              key={id}
              className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-neutral-900 px-2 py-0.5 text-sm font-medium"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
      {!!optionalActivities?.length && (
        <div className="flex items-start gap-x-2 text-sm">
          <span className="whitespace-nowrap font-medium">
            Optional Activities:
          </span>
          <ul className="flex flex-wrap gap-x-1 gap-y-1 text-white">
            {optionalActivities?.map(({ id, name }) => (
              <li
                key={id}
                className="flex items-center gap-x-1 whitespace-nowrap rounded-full bg-sky-700 px-2 py-0.5 text-sm font-medium"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <GuideSelector guides={guides} itineraryId={id} defaultValue={guide} />
    </div>
  );
}

function GuideSelector({
  defaultValue,
  guides,
  itineraryId,
}: {
  defaultValue: string | null;
  guides: SelectGuidesWithCountries[];
  itineraryId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [guide, setGuide] = useState<string>(defaultValue ?? "");
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between overflow-hidden"
          type="button"
        >
          {guide ? guide : "Select a guide"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        <Command>
          <CommandInput placeholder="Search company..." />
          <CommandEmpty>No company found.</CommandEmpty>
          <CommandGroup>
            {guides?.map(({ id, name }) => (
              <CommandItem
                key={id}
                value={name ?? ""}
                onSelect={async () => {
                  setGuide(name === guide ? "" : name ?? "");
                  setIsOpen(false);
                  await updateBookingItineraryGuide({
                    itineraryId,
                    guide: name,
                  });
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    guide === name ? "opacity-100" : "opacity-0",
                  )}
                />
                {name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
