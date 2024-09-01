import { SelectCountries, SelectReservations } from "@/drizzle/schema";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { generateRandomId } from "@/utils/generate-random-id";
import { format } from "date-fns";
import ReservationModal from "./reservation-modal";
import { Input } from "@/components/ui/input";

type Reservation = Omit<SelectReservations, "id" | "createdAt" | "updatedAt">;

export default function Reservations({
  type,
  reservationsList,
  tourCountries,
  setReservationsList,
}: {
  type?: "booking" | "reservation" | "aviation";
  reservationsList: Reservation[];
  tourCountries: SelectCountries[];
  setReservationsList: (
    cb: (reservationsList: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [editedReservation, setEditedReservation] = useState<
    Reservation & { index: number }
  >();

  const [isReservationOpen, setIsReservationOpen] = useState(false);

  return (
    <>
      <Table className="mt-8 rounded border">
        <TableHeader>
          <TableRow>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Hotel</TableHead>
            <TableHead>Meal</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Target Price</TableHead>
            {type === "reservation" && <TableHead>Final Price</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservationsList?.map((props, index) => (
            <TableRow
              key={generateRandomId()}
              onClick={() => {
                setEditedReservation({
                  ...props,
                  hotels: [...props.hotels!],
                  index,
                });
                setIsReservationOpen(true);
              }}
            >
              <TableCell>
                {!props.start ? "Start Date" : format(props.start, "dd/MM/yyy")}
              </TableCell>
              <TableCell>
                {!props.end ? "End Date" : format(props.end, "dd/MM/yyy")}
              </TableCell>
              <TableCell>{props.city?.name}</TableCell>
              <TableCell>{props.hotels?.map((name) => `${name}, `)}</TableCell>
              <TableCell>{props.meal}</TableCell>
              <TableCell>{props.currency}</TableCell>
              <TableCell>{props.targetPrice}</TableCell>
              {type === "reservation" ? (
                <TableCell>
                  <Input
                    placeholder="Final price..."
                    defaultValue={props.finalPrice ?? undefined}
                    type="number"
                    onChange={(e) =>
                      setReservationsList((prev) => {
                        prev[index].finalPrice = isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber;
                        return [...prev];
                      })
                    }
                  />
                </TableCell>
              ) : (
                <TableCell>{props.finalPrice}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="secondary"
        className="mt-4"
        onClick={() => setIsReservationOpen(true)}
      >
        Add reservation
      </Button>

      {isReservationOpen && (
        <ReservationModal
          isOpen={isReservationOpen}
          setIsOpen={setIsReservationOpen}
          setReservationsList={setReservationsList}
          selectedCountry={tourCountries[0]}
          editedReservation={editedReservation}
          setEditedReservation={setEditedReservation}
        />
      )}
    </>
  );
}
