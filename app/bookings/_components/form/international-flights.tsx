import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDateString } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Upload, X } from "lucide-react";
import UploadImage from "../upload-image";
import { generateRandomId } from "@/utils/generate-random-id";
import { internationalFlightDefaultValue } from "@/utils/default-values";
import ForPage from "../for-page";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { SelectCities } from "@/drizzle/schema";

export default function InternationalFlights({
  internationalFlights,
  modalMode,
  setInternationalFlights,
  cities,
}: {
  cities: SelectCities[];
  internationalFlights: (InternationalFlights & {
    src?: string;
  })[];
  modalMode: "add" | "edit";
  setInternationalFlights: (
    cb: (values: InternationalFlights[]) => InternationalFlights[],
  ) => void;
}) {
  return (
    <>
      <h3 className="pb-2 text-xl font-semibold">International Flights</h3>
      <div className="flex flex-col gap-y-4">
        {internationalFlights?.map((flight, i) => (
          <div key={flight.id} className="flex gap-x-4">
            <div className="flex flex-grow flex-col gap-y-4">
              <div className="flex gap-x-4">
                <FormItem className=" flex flex-col justify-start">
                  <FormLabel>Arrival Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            "w-[160px] pl-3 text-left font-normal",
                            !flight.arrival.arrivalDate &&
                              "text-muted-foreground",
                          )}
                        >
                          {flight.arrival.arrivalDate ? (
                            `${format(flight.arrival.arrivalDate, "PPP")}`
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          flight.arrival.arrivalDate
                            ? new Date(flight.arrival.arrivalDate)
                            : undefined
                        }
                        onSelect={(value) => {
                          if (!value) return;
                          setInternationalFlights((prev) => {
                            prev[i].arrival.arrivalDate = format(
                              value,
                              "yyyy-MM-dd",
                            );
                            return [...prev];
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
                <FormItem className="relative flex flex-col justify-start">
                  <FormLabel>Arrival Time</FormLabel>
                  <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                    {internationalFlights[i].arrival.arrivalTime
                      ? formatDateString(
                          internationalFlights[i].arrival.arrivalTime!,
                        )
                      : "--:--"}
                  </div>
                  <Input
                    type="time"
                    onChange={(e) =>
                      setInternationalFlights((prev) => {
                        prev[i].arrival.arrivalTime =
                          e.target.value ?? undefined;
                        return [...prev];
                      })
                    }
                  />
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>Number</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={flight.arrival.flightNumber}
                      onChange={(e) =>
                        setInternationalFlights((prev) => {
                          prev[i].arrival.flightNumber = e.target.value;
                          return [...prev];
                        })
                      }
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>From</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !flight.arrival.from && "text-muted-foreground",
                          )}
                          disabled={!cities?.length}
                        >
                          {flight.arrival.from || "Select from city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search city..." />
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {cities?.map((city) => (
                            <CommandItem
                              key={city.id}
                              onSelect={() => {
                                setInternationalFlights((prev) => {
                                  prev[i].arrival.from = city.name ?? undefined;
                                  return [...prev];
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  flight.arrival.from === city.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>To</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !flight.arrival.to && "text-muted-foreground",
                          )}
                          disabled={!cities?.length}
                        >
                          {flight.arrival.to || "Select to city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search city..." />
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {cities?.map((city) => (
                            <CommandItem
                              key={city.id}
                              onSelect={() => {
                                setInternationalFlights((prev) => {
                                  prev[i].arrival.to = city.name ?? undefined;
                                  return [...prev];
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  flight.arrival.to === city.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>Reference ticket</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={flight.arrival.referenceTicket}
                      onChange={(e) =>
                        setInternationalFlights((prev) => {
                          prev[i].arrival.referenceTicket = e.target.value;
                          return [...prev];
                        })
                      }
                    />
                  </FormControl>
                </FormItem>
              </div>
              <div className="flex gap-x-4">
                <FormItem className="flex flex-col justify-start">
                  <FormLabel>Departure Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            "w-[160px] pl-3 text-left font-normal",
                            !flight.departure.departureDate &&
                              "text-muted-foreground",
                          )}
                        >
                          {flight.departure.departureDate ? (
                            `${format(flight.departure.departureDate, "PPP")}`
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          flight.departure.departureDate
                            ? new Date(flight.departure.departureDate)
                            : undefined
                        }
                        onSelect={(value) => {
                          if (!value) return;
                          setInternationalFlights((prev) => {
                            prev[i].departure.departureDate = format(
                              value,
                              "yyyy-MM-dd",
                            );
                            return [...prev];
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
                <FormItem className="relative flex flex-col justify-start">
                  <FormLabel>Departure Time</FormLabel>
                  <div className="absolute left-1 top-5 bg-white px-6 py-1 text-sm">
                    {internationalFlights[i].departure.departureTime
                      ? formatDateString(
                          internationalFlights[i].departure.departureTime!,
                        )
                      : "--:--"}
                  </div>
                  <Input
                    type="time"
                    onChange={(e) =>
                      setInternationalFlights((prev) => {
                        prev[i].departure.departureTime =
                          e.target.value ?? undefined;
                        return [...prev];
                      })
                    }
                  />
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>Number</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={flight.departure.flightNumber}
                      onChange={(e) =>
                        setInternationalFlights((prev) => {
                          prev[i].departure.flightNumber = e.target.value;
                          return [...prev];
                        })
                      }
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>From</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !flight.departure.from && "text-muted-foreground",
                          )}
                          disabled={!cities?.length}
                        >
                          {flight.departure.from || "Select from city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search city..." />
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {cities?.map((city) => (
                            <CommandItem
                              key={city.id}
                              onSelect={() => {
                                setInternationalFlights((prev) => {
                                  prev[i].departure.from =
                                    city.name ?? undefined;
                                  return [...prev];
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  flight.departure.from === city.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
                <FormItem className="flex flex-grow flex-col justify-start">
                  <FormLabel>To</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !flight.departure.to && "text-muted-foreground",
                          )}
                          disabled={!cities?.length}
                        >
                          {flight.departure.to || "Select to city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search city..." />
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {cities?.map((city) => (
                            <CommandItem
                              key={city.id}
                              onSelect={() => {
                                setInternationalFlights((prev) => {
                                  prev[i].departure.to = city.name ?? undefined;
                                  return [...prev];
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  flight.departure.to === city.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
                <FormItem className=" flex flex-grow flex-col justify-start">
                  <FormLabel>Reference ticket</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={flight.departure.referenceTicket}
                      onChange={(e) =>
                        setInternationalFlights((prev) => {
                          prev[i].departure.referenceTicket = e.target.value;
                          return [...prev];
                        })
                      }
                    />
                  </FormControl>
                </FormItem>
              </div>
            </div>
            <FormItem className="group relative flex flex-col justify-start">
              <FormLabel htmlFor={flight.id} className="flex flex-col gap-y-2">
                Ticket
                <UploadImage
                  title="Upload International Flights Ticket"
                  images={
                    (modalMode === "edit" ? flight.urls : flight.files) ?? []
                  }
                  setImages={(images) => {
                    if (modalMode === "edit")
                      setInternationalFlights((prev) => {
                        prev[i].urls = images;
                        return [...prev];
                      });
                    else
                      setInternationalFlights((prev) => {
                        prev[i].files = images;
                        return [...prev];
                      });
                  }}
                  button={
                    <div
                      className={cn(
                        "flex h-10 cursor-pointer items-center justify-center rounded border hover:bg-sky-100",
                        {
                          "bg-sky-100":
                            flight.files?.length || flight.urls?.length,
                        },
                      )}
                    >
                      <Upload strokeWidth={2} size={18} />
                    </div>
                  }
                />
              </FormLabel>
            </FormItem>
            <X
              size={18}
              className={cn("mt-8 cursor-pointer text-red-500", {
                hidden: internationalFlights?.length < 2,
              })}
              onClick={() => {
                if (internationalFlights?.length <= 1) return;
                setInternationalFlights((prev) =>
                  prev.filter((f) => f.id !== flight.id),
                );
              }}
            />
          </div>
        ))}
        <ForPage type="single" page="/bookings">
          <Button
            type="button"
            variant="secondary"
            className="mt-4 self-start"
            onClick={() =>
              setInternationalFlights((prev) => [
                ...prev,
                {
                  ...internationalFlightDefaultValue,
                  id: generateRandomId(),
                },
              ])
            }
          >
            Add Flight
          </Button>
        </ForPage>
      </div>
    </>
  );
}
