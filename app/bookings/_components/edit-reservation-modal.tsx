import {
  SelectCities,
  SelectHotels,
  SelectReservations,
} from "@/drizzle/schema";
import { getCityHotels } from "@/utils/db-queries/hotel";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { generateRandomId } from "@/utils/generate-random-id";
import { format } from "date-fns";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import capitalize from "@/utils/capitalize";

type Reservation = Omit<
  SelectReservations,
  "id" | "createdAt" | "updatedAt" | "bookingId" | "finalPrice"
>;

export default function EditReservationModal({
  isOpen,
  setIsOpen,
  editedReservation,
  setEditedReservation,
  setReservationsList,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  editedReservation: (Reservation & { index: number })[];
  setEditedReservation: (
    cb: (
      reservations: (Reservation & { index: number })[],
    ) => (Reservation & { index: number })[],
  ) => void;
  setReservationsList: (
    cb: (reservations: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [cityHotels, setCityHotels] = useState<SelectHotels[]>([]);
  const listCityHotels = useCallback(async () => {
    try {
      const hotels = await getCityHotels({
        countryId: editedReservation[0].city?.countryId!,
        cityId: editedReservation[0].city?.id!,
      });
      setCityHotels(hotels);
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listCityHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) {
          setCityHotels([]);
          setEditedReservation(() => []);
        }
      }}
    >
      <DialogContent className="max-h-screen min-w-[1280px] gap-y-2 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {editedReservation[0].city?.name} Reservation
          </DialogTitle>
        </DialogHeader>
        <Table className="mt-4 rounded border">
          <TableHeader>
            <TableRow>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Meal</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Target Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedReservation?.map((reservation, i) => (
              <ReservationTableRow
                key={generateRandomId()}
                {...reservation}
                index={i}
                listLength={editedReservation?.length}
                cityHotels={cityHotels}
                editedReservation={editedReservation}
                setEditedReservation={setEditedReservation}
              />
            ))}
          </TableBody>
        </Table>
        <DialogFooter className="flex w-full justify-between pt-4">
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => {
              setEditedReservation((prev) => [
                ...prev,
                {
                  start: null,
                  end: prev[prev?.length - 1].end,
                  hotels: [],
                  meal: null,
                  targetPrice: null,
                  index: prev[prev?.length - 1].index + 1,
                  city: prev[0].city,
                  currency: "USD",
                },
              ]);
            }}
          >
            Add
          </Button>
          <div className="flex gap-x-2">
            <Button type="button" variant={"outline"}>
              Cancel
            </Button>
            <Button
              className="flex gap-x-1"
              onClick={() => {
                setReservationsList((prev) => {
                  const firstPart = prev.slice(0, editedReservation[0].index);
                  const lastPart = prev.slice(editedReservation[0].index + 1);
                  const newList = [
                    ...firstPart,
                    ...editedReservation,
                    ...lastPart,
                  ];
                  return newList;
                });
                setCityHotels([]);
                setEditedReservation(() => []);
                setIsOpen(false);
              }}
            >
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReservationTableRow({
  start,
  end,
  meal,
  targetPrice,
  cityHotels,
  index,
  listLength,
  editedReservation,
  currency,
  setEditedReservation,
}: Reservation & {
  cityHotels: SelectCities[];
  index: number;
  listLength: number;
  editedReservation: (Reservation & { index: number })[];
  setEditedReservation: (
    cb: (
      reservations: (Reservation & { index: number })[],
    ) => (Reservation & { index: number })[],
  ) => void;
}) {
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [endAt, setEndAt] = useState<Date | null>(end);

  return (
    <TableRow>
      <TableCell>
        {start ? format(start, "dd/MM/yyyy") : "Previous end date ↗"}
      </TableCell>
      <TableCell>
        {index === listLength - 1 ? (
          end ? (
            format(end, "dd/MM/yyyy")
          ) : (
            "End date"
          )
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !endAt && "text-muted-foreground",
                  )}
                >
                  {endAt ? format(endAt, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endAt ?? undefined}
                onSelect={(date) => {
                  setEndAt(date ?? null);
                  setEditedReservation((prev) => {
                    prev[index + 1].start = date ?? null;
                    prev[index].end = date ?? null;
                    return [...prev];
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      </TableCell>
      <TableCell>
        <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
          <PopoverTrigger asChild disabled={!cityHotels?.length}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={hotelsOpen}
              className="w-full justify-between overflow-hidden"
            >
              {editedReservation[index].hotels?.length
                ? editedReservation[index].hotels?.map((hotel) =>
                    capitalize(`${hotel}, `),
                  )
                : "Select a hotel"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className=" p-0">
            <Command>
              <CommandInput placeholder="Search hotel..." />
              <CommandEmpty>No hotels found.</CommandEmpty>
              <CommandGroup>
                {cityHotels?.map(({ id, name }) => (
                  <CommandItem key={id} className="flex items-center gap-x-2">
                    <Checkbox
                      checked={editedReservation[index].hotels.includes(
                        name ?? "",
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditedReservation(() => {
                            if (
                              !editedReservation[index].hotels.includes(name!)
                            )
                              editedReservation[index].hotels.push(name!);
                            return [...editedReservation];
                          });
                        } else {
                          setEditedReservation(() => {
                            editedReservation[index].hotels = editedReservation[
                              index
                            ].hotels.filter((hotel) => hotel !== name);
                            return [...editedReservation];
                          });
                        }
                        setHotelsOpen(false);
                      }}
                    />
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Input
          placeholder="Meal..."
          defaultValue={meal ?? undefined}
          onBlur={(e) =>
            setEditedReservation((prev) => {
              prev[index].meal = e.target.value;
              return [...prev];
            })
          }
        />
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            setEditedReservation(() => {
              editedReservation[index].currency = value;
              return [...editedReservation];
            })
          }
          defaultValue={currency ?? "USD"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a currency" />
          </SelectTrigger>
          <SelectContent>
            {["USD", "EUR", "EGP"]?.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          defaultValue={targetPrice ?? undefined}
          placeholder="Price..."
          type="number"
          onBlur={(e) => {
            setEditedReservation(() => {
              editedReservation[index].targetPrice = e.target.valueAsNumber;
              return [...editedReservation];
            });
          }}
        />
      </TableCell>
    </TableRow>
  );
}
