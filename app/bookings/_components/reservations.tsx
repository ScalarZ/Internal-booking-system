import { SelectCountries, SelectReservations } from "@/drizzle/schema";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ReservationModal from "./reservation-modal";
import { Input } from "@/components/ui/input";
import ForPage from "./for-page";
import { usePathname } from "next/navigation";

type Reservation = Omit<SelectReservations, "id" | "createdAt" | "updatedAt">;

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
  const pathname = usePathname();
  const [editedReservation, setEditedReservation] = useState<
    Reservation & { index: number }
  >();

  const sortedReservations = useMemo(
    () =>
      reservationsList.sort((a, b) => {
        if (!a.start || !b.start) return -1;
        if (a.start === b.start) {
          if (!a.end || !b.end) return -1;
          return a.end?.getTime() - b.end?.getTime();
        }
        return a.start?.getTime() - b.start?.getTime();
      }),
    [reservationsList],
  );

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
            <TableHead>Final Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReservations?.map((props, index) => (
            <TableRow
              key={index}
              onClick={() => {
                if (pathname !== "/bookings") return;
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
              {pathname === "/reservations" ? (
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
      <ForPage type="single" page="/bookings">
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => setIsReservationOpen(true)}
        >
          Add reservation
        </Button>
      </ForPage>
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
