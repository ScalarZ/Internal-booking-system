"use client";

import { DataTable } from "@/app/create/_components/data-table";
import {
  Bookings as BookingsType,
  SelectCompanies,
  SelectCountries,
  SelectNationalities,
  SelectNileCruises,
  SelectToursWithItineraries,
  SelectBookingToursWithItineraries,
} from "@/drizzle/schema";
import { columns } from "./columns";
import FilterBookings from "./filter-bookings";
import DeleteBookingModal from "./delete-booking-modal";
import { useQuery } from "@tanstack/react-query";
import { filterBookings, getBookings } from "@/utils/db-queries/booking";
import BookingModal from "./booking-modal";
import { useBooking } from "@/context/booking-context";
import CreateBooking from "./create-booking";
import { usePathname } from "next/navigation";

export default function Bookings({
  companies,
  countries,
  tours,
  nationalities,
  nileCruises,
  filter,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  tours: SelectToursWithItineraries[] | SelectBookingToursWithItineraries[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  filter: any;
}) {
  const {
    booking,
    setBooking,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
  } = useBooking();

  const pathname = usePathname();

  const { data, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: !filter ? getBookings : () => filterBookings(filter),
  });
  if (error || !data) return <p>Error fetching bookings</p>;
  return (
    <div className="space-y-4">
      <div className="flex gap-x-8">
        <FilterBookings countries={countries} />
        <CreateBooking
          nileCruises={nileCruises}
          companies={companies}
          nationalities={nationalities}
          tours={tours}
        />
      </div>
      <DataTable
        // @ts-ignore
        columns={columns({
          pathname,
          setBooking,
          setIsEditModalOpen,
          setIsDeleteModalOpen,
        })}
        data={data}
        onRowClick={(row: BookingsType) => {
          setBooking(row);
          setIsDeleteModalOpen(false);
          setIsEditModalOpen(true);
        }}
        pathname={pathname}
      />
      {booking && isEditModalOpen && (
        <BookingModal
          modalMode="edit"
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
        />
      )}
      {booking && isDeleteModalOpen && (
        <DeleteBookingModal bookingId={booking.id} />
      )}
    </div>
  );
}
