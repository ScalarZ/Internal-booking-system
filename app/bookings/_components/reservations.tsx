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
import EditReservationModal from "./edit-reservation-modal";
import AddReservationModal from "./add-reservation-modal";

type Reservation = Omit<
  SelectReservations,
  "id" | "createdAt" | "updatedAt" | "bookingId" | "finalPrice"
>;

export default function Reservations({
  reservationsList,
  tourCountries,
  setReservationsList,
}: {
  reservationsList: Reservation[];
  tourCountries: SelectCountries[];
  setReservationsList: (
    cb: (reservationsList: Reservation[]) => Reservation[],
  ) => void;
}) {
  const [editedReservation, setEditedReservation] = useState<
    (Reservation & { index: number })[]
  >([]);

  const [isEditReservationOpen, setIsEditReservationOpen] = useState(false);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservationsList?.map(
            (
              { start, end, city, hotels, meal, targetPrice, currency },
              index,
            ) => (
              <TableRow
                key={generateRandomId()}
                onClick={() => {
                  setEditedReservation([
                    {
                      start,
                      end,
                      city,
                      hotels: [...hotels!],
                      meal,
                      targetPrice,
                      index,
                      currency,
                    },
                  ]);
                  setIsEditReservationOpen(true);
                }}
              >
                <TableCell>
                  {!start ? "Start Date" : format(start, "dd/MM/yyy")}
                </TableCell>
                <TableCell>
                  {!end ? "End Date" : format(end, "dd/MM/yyy")}
                </TableCell>
                <TableCell>{city?.name}</TableCell>
                <TableCell>{hotels?.map((name) => `${name}, `)}</TableCell>
                <TableCell>{meal}</TableCell>
                <TableCell>{currency}</TableCell>
                <TableCell>{targetPrice}</TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="secondary"
        className="mt-4"
        onClick={() => setIsAddReservationOpen(true)}
      >
        Add reservation
      </Button>
      {isEditReservationOpen && (
        <EditReservationModal
          isOpen={isEditReservationOpen}
          setIsOpen={setIsEditReservationOpen}
          editedReservation={editedReservation}
          setEditedReservation={setEditedReservation}
          setReservationsList={setReservationsList}
        />
      )}
      {isAddReservationOpen && (
        <AddReservationModal
          isOpen={isAddReservationOpen}
          setIsOpen={setIsAddReservationOpen}
          setReservationsList={setReservationsList}
          selectedCountry={tourCountries[0]}
        />
      )}
    </>
  );
}
