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
import { domesticFlightDefaultValue } from "@/utils/default-values";
import { Switch } from "@/components/ui/switch";
import ForPage from "../for-page";

export default function DomesticFlights({
  domesticFlights,
  modalMode,
  setDomesticFlights,
}: {
  domesticFlights: (DomesticFlights & {
    src?: string;
  })[];
  modalMode: "add" | "edit";
  setDomesticFlights: (
    cb: (values: DomesticFlights[]) => DomesticFlights[],
  ) => void;
}) {
  return (
    <>
      <h3 className="pb-2 text-xl font-semibold">Domestic Flights</h3>
      <div className="flex flex-col gap-y-4">
        {domesticFlights?.map((flight, i) => (
          <div key={flight.id} className="space-y-4">
            <div className="flex gap-x-4">
              <div className="flex flex-grow flex-col gap-y-4">
                <div className="flex gap-x-4">
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Included</FormLabel>
                    <FormControl>
                      <Switch
                        checked={flight.arrival.included}
                        onCheckedChange={(value) =>
                          setDomesticFlights((prev) => {
                            prev[i].arrival.included = value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-col justify-start">
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
                            setDomesticFlights((prev) => {
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
                      {domesticFlights[i].arrival.arrivalTime
                        ? formatDateString(
                            domesticFlights[i].arrival.arrivalTime!,
                          )
                        : "--:--"}
                    </div>
                    <Input
                      type="time"
                      onChange={(e) =>
                        setDomesticFlights((prev) => {
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
                          setDomesticFlights((prev) => {
                            prev[i].arrival.flightNumber = e.target.value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-grow flex-col justify-start">
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={flight.arrival.from}
                        onChange={(e) =>
                          setDomesticFlights((prev) => {
                            prev[i].arrival.from = e.target.value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-grow flex-col justify-start">
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={flight.arrival.to}
                        onChange={(e) =>
                          setDomesticFlights((prev) => {
                            prev[i].arrival.to = e.target.value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Issued</FormLabel>
                    <FormControl>
                      <Switch
                        checked={flight.arrival.issued}
                        onCheckedChange={(value) =>
                          setDomesticFlights((prev) => {
                            prev[i].arrival.issued = value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                </div>
                <div className="flex gap-x-4">
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Included</FormLabel>
                    <FormControl>
                      <Switch
                        checked={flight.departure.included}
                        onCheckedChange={(value) =>
                          setDomesticFlights((prev) => {
                            prev[i].departure.included = value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
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
                            setDomesticFlights((prev) => {
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
                      {domesticFlights[i].departure.departureTime
                        ? formatDateString(
                            domesticFlights[i].departure.departureTime!,
                          )
                        : "--:--"}
                    </div>
                    <Input
                      type="time"
                      onChange={(e) =>
                        setDomesticFlights((prev) => {
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
                          setDomesticFlights((prev) => {
                            prev[i].departure.flightNumber = e.target.value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-grow flex-col justify-start">
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={flight.departure.from}
                        onChange={(e) =>
                          setDomesticFlights((prev) => {
                            prev[i].departure.from = e.target.value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-grow flex-col justify-start">
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={flight.departure.to}
                        onChange={(e) =>
                          setDomesticFlights((prev) => {
                            prev[i].departure.to = e.target.value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex flex-col justify-start">
                    <FormLabel>Issued</FormLabel>
                    <FormControl>
                      <Switch
                        checked={flight.departure.issued}
                        onCheckedChange={(value) =>
                          setDomesticFlights((prev) => {
                            prev[i].departure.issued = value;
                            return [...prev];
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>
              <FormItem className="group relative flex flex-col justify-start">
                <FormLabel
                  htmlFor={flight.id}
                  className="flex flex-col gap-y-2"
                >
                  Ticket
                  <UploadImage
                    title="Upload Domestic Flights Ticket"
                    images={
                      (modalMode === "edit" ? flight.urls : flight.files) ?? []
                    }
                    setImages={(images) => {
                      if (modalMode === "edit")
                        setDomesticFlights((prev) => {
                          prev[i].urls = images;
                          return [...prev];
                        });
                      else
                        setDomesticFlights((prev) => {
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
                  hidden: domesticFlights?.length < 2,
                })}
                onClick={() => {
                  if (domesticFlights?.length <= 1) return;
                  setDomesticFlights((prev) =>
                    prev.filter((f) => f.id !== flight.id),
                  );
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-x-4">
              <FormItem className="flex flex-grow flex-col justify-start">
                <FormLabel>Fair EGP</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    defaultValue={flight.fairEGP}
                    onChange={(e) =>
                      setDomesticFlights((prev) => {
                        prev[i].fairEGP = e.target.valueAsNumber;
                        return [...prev];
                      })
                    }
                  />
                </FormControl>
              </FormItem>
              <FormItem className="flex flex-grow flex-col justify-start">
                <FormLabel>Booking Reference</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={flight.bookingReference}
                    onChange={(e) =>
                      setDomesticFlights((prev) => {
                        prev[i].bookingReference = e.target.value;
                        return [...prev];
                      })
                    }
                  />
                </FormControl>
              </FormItem>
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Date of issue</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !flight.issuedDate && "text-muted-foreground",
                        )}
                      >
                        {flight.issuedDate ? (
                          `${format(flight.issuedDate, "PPP")}`
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
                        flight.issuedDate
                          ? new Date(flight.issuedDate)
                          : undefined
                      }
                      onSelect={(value) => {
                        if (!value) return;
                        setDomesticFlights((prev) => {
                          prev[i].issuedDate = format(value, "yyyy-MM-dd");
                          return [...prev];
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>
          </div>
        ))}
        <ForPage type="single" page="/bookings">
          <Button
            type="button"
            variant="secondary"
            className="self-start"
            onClick={() =>
              setDomesticFlights((prev) => [
                ...prev,
                {
                  ...domesticFlightDefaultValue,
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
