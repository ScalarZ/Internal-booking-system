import {
  SelectBookingItineraries,
  SelectBookingWithItineraries,
} from "@/drizzle/schema";
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
import { queryClient } from "@/utils/provider";
import { format } from "date-fns";

export default function ItineraryCard({
  id,
  day,
  dayNumber,
  cities,
  activities,
  optionalActivities,
  guide,
  optionalGuide,
  guides,
  currentWeek,
  tourId,
}: SelectBookingItineraries & { i: number } & {
  guides: SelectGuidesWithCountries[];
  currentWeek: Date;
}) {
  return (
    <div
      className="flex w-full max-w-[293px] grow flex-col justify-between gap-y-1 overflow-auto border p-2"
      key={id}
    >
      <div className="flex flex-col gap-y-1">
        <span className="font-medium">Day {dayNumber}</span>
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
      </div>
      <div className="flex flex-col gap-y-1">
        <GuideSelector
          guides={guides}
          itineraryId={id}
          defaultValue={guide}
          currentWeek={currentWeek}
          tourId={tourId!}
        />
        <GuideSelector
          guides={guides}
          itineraryId={id}
          defaultValue={optionalGuide}
          currentWeek={currentWeek}
          tourId={tourId!}
          optional
        />
      </div>
    </div>
  );
}

function GuideSelector({
  defaultValue,
  guides,
  itineraryId,
  currentWeek,
  tourId,
  optional = false,
}: {
  defaultValue: string | null;
  guides: SelectGuidesWithCountries[];
  itineraryId: number;
  tourId: string;
  currentWeek: Date;
  optional?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [guide, setGuide] = useState<string>(defaultValue ?? "");
  async function handleSelect(name: string) {
    setGuide(name === guide ? "" : name ?? "");
    setIsOpen(false);
    await updateBookingItineraryGuide({
      itineraryId,
      guide: name,
      optional,
    });
    queryClient.setQueryData(
      [format(currentWeek, "yyyy-MM-dd")],
      (prevData: SelectBookingWithItineraries[] | undefined) => {
        if (!prevData) return;
        return prevData.map((booking) => {
          if (booking.bookingTour.id === tourId) {
            return {
              ...booking,
              bookingTour: {
                ...booking.bookingTour,
                itineraries: booking.bookingTour.itineraries?.map(
                  (itinerary) => {
                    if (itinerary.id === itineraryId) {
                      return {
                        ...itinerary,
                        ...(optional
                          ? { optionalGuide: name }
                          : { guide: name }),
                      };
                    }
                    return itinerary;
                  },
                ),
              },
            };
          }
          return booking;
        });
      },
    );
  }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between self-end overflow-hidden"
          type="button"
        >
          {guide
            ? guide
            : optional
              ? "Select an optional guide"
              : "Select a guide"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
        <Command>
          <CommandInput placeholder="Search guide..." />
          <CommandEmpty>No guide found.</CommandEmpty>
          <CommandGroup>
            {guides?.map(({ id, name }) => (
              <CommandItem
                key={id}
                value={name ?? ""}
                onSelect={() => handleSelect(name ?? "")}
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
