"use client";

import React, { useState } from "react";
import {
  Bookings,
  SelectRepresentatives,
  SelectBuses,
  SelectDrivers,
} from "@/drizzle/schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  updateTrafficSheetBookingRepresentative,
  updateTrafficSheetBookingBus,
  updateTrafficSheetBookingDriver,
  updateTrafficSheetBookingNote,
} from "@/utils/db-queries/booking";
import { queryClient } from "@/utils/provider";
import useURLQuery from "@/hooks/use-url-query";
import postgres from "postgres";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const SelectCell = ({
  row,
  options,
  type,
  updateFunction,
}: {
  row: {
    original: {
      id: number;
      domesticId: string;
      departure?: { [key: string]: string | undefined };
    };
  };

  updateFunction: (
    id: number,
    domesticId: string,
    value: string,
  ) => Promise<postgres.RowList<Record<string, unknown>[]>>;
} & (
  | {
      options: SelectRepresentatives[];
      type: "representative";
    }
  | {
      options: SelectBuses[];
      type: "bus";
    }
  | {
      options: SelectDrivers[];
      type: "driver";
    }
)) => {
  const { params } = useURLQuery();
  const date = params.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const city = params.get("city");
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    row.original.departure?.[type] || "",
  );
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={!options}>
        <Button variant="outline">
          {selectedValue || `Select ${capitalize(type)}s`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${type}s...`} />
          <CommandList>
            <CommandEmpty>No {type}s found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={async () => {
                    queryClient.setQueryData(
                      ["traffic-sheet", date, city],
                      (
                        data: (Bookings & {
                          departure: DepartureInfo;
                          domesticId: string;
                        })[],
                      ) =>
                        data.map((booking) => {
                          if (booking.id === row.original.id) {
                            return {
                              ...booking,
                              departure: {
                                ...booking.departure,
                                [type]: option.name,
                              },
                            };
                          }
                          return booking;
                        }),
                    );
                    setSelectedValue(option.name!);
                    setOpen(false);
                    await updateFunction(
                      row.original.id,
                      row.original.domesticId,
                      option.name!,
                    );
                  }}
                >
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const NoteCell = ({
  row,
}: {
  row: {
    original: { id: number; domesticId: string; departure?: { note?: string } };
  };
}) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(row.original.departure?.note || "");
  const { params } = useURLQuery();
  const date = params.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const city = params.get("city");

  const handleSave = async () => {
    queryClient.setQueryData(
      ["traffic-sheet", date, city],
      (data: (Bookings & { departure: DepartureInfo; domesticId: string })[]) =>
        data.map((booking) => {
          if (booking.id === row.original.id) {
            return {
              ...booking,
              departure: {
                ...booking.departure,
                note,
              },
            };
          }
          return booking;
        }),
    );
    setOpen(false);
    await updateTrafficSheetBookingNote(
      row.original.id,
      row.original.domesticId,
      note,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{note ? "Edit Note" : "Add Note"}</Button>
      </DialogTrigger>
      <DialogContent>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter note here..."
          rows={5}
          className="mt-4"
        />
        <Button onClick={handleSave}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};

export const columns = (
  representatives: SelectRepresentatives[],
  buses: SelectBuses[],
  drivers: SelectDrivers[],
): ColumnDef<Bookings & { departure: DepartureInfo; domesticId: string }>[] => [
  {
    accessorKey: "internalBookingId",
    header: "File",
  },
  {
    accessorKey: "departure.from",
    header: "FROM",
  },
  {
    accessorKey: "departure.to",
    header: "To",
  },
  {
    accessorKey: "departure.flightNumber",
    header: "Flight",
  },
  {
    accessorKey: "departure.departureTime",
    header: "Time",
  },
  {
    accessorKey: "pax",
    header: "PAX",
  },
  // Add the new columns
  {
    id: "representatives",
    header: "Representatives",
    cell: ({ row }) => (
      <SelectCell
        row={row}
        options={representatives}
        type="representative"
        updateFunction={updateTrafficSheetBookingRepresentative}
      />
    ),
  },
  {
    id: "buses",
    header: "Buses",
    cell: ({ row }) => (
      <SelectCell
        row={row}
        options={buses}
        type="bus"
        updateFunction={updateTrafficSheetBookingBus}
      />
    ),
  },
  {
    id: "drivers",
    header: "Drivers",
    cell: ({ row }) => (
      <SelectCell
        row={row}
        options={drivers}
        type="driver"
        updateFunction={updateTrafficSheetBookingDriver}
      />
    ),
  },
  {
    id: "note",
    header: "Note",
    cell: ({ row }) => <NoteCell row={row} />,
  },
];
