"use client";

import { DataTable } from "@/app/create/_components/data-table";
import {
  SelectBookings,
  SelectBookingWithReservations,
  SelectCompanies,
  SelectCountries,
  SelectNationalities,
  SelectNileCruises,
  SelectTours,
} from "@/drizzle/schema";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import EditBookingModal from "./edit-booking-modal";
import FilterBookings from "./filter-bookings";
import DeleteBookingModal from "./delete-booking-modal";
import { useQuery } from "@tanstack/react-query";
import { getBooking, getBookings } from "@/utils/db-queries/booking";
import { createClient } from "@/utils/supabase/client";
import { queryClient } from "@/utils/provider";

export default function Bookings({
  companies,
  countries,
  tours,
  nationalities,
  nileCruises,
  type,
}: {
  countries: SelectCountries[];
  companies: SelectCompanies[];
  tours: SelectTours[];
  nationalities: SelectNationalities[];
  nileCruises: SelectNileCruises[];
  type?: "booking" | "reservation" | "aviation";
}) {
  const [initialValues, setInitialValues] =
    useState<SelectBookingWithReservations | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime bookings")
      .on(
        //@ts-ignore
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        async (payload: {
          eventType: "INSERT" | "UPDATE" | "DELETE";
          new: { id: number };
          old: { id: number };
        }) => {
          console.log(payload);
          try {
            if (payload.eventType === "DELETE") {
              queryClient.setQueryData(
                ["bookings"],
                (data: SelectBookingWithReservations[]) => {
                  const index = data.findIndex((b) => b.id === payload.old.id);
                  if (index > -1) {
                    return [...data.slice(0, index), ...data.slice(index + 1)];
                  } else {
                    return data;
                  }
                },
              );
              return;
            }
            const booking = await getBooking(payload.new.id);
            queryClient.setQueryData(
              ["bookings"],
              (data: SelectBookingWithReservations[]) => {
                if (payload.eventType === "INSERT") return [...data, booking];
                if (payload.eventType === "UPDATE") {
                  const index = data.findIndex((b) => b.id === booking?.id);
                  if (index > -1) {
                    return [
                      ...data.slice(0, index),
                      booking,
                      ...data.slice(index + 1),
                    ];
                  } else {
                    return data;
                  }
                }
                return data;
              },
            );
          } catch (err) {
            console.error(err);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (error || !data) return <p>Error fetching bookings</p>;

  return (
    <div>
      <FilterBookings countries={countries} />
      <DataTable
        columns={columns({
          setInitialValues,
          setIsEditModalOpen,
          setIsDeleteModalOpen,
          type:"reservation",
        })}
        data={data}
        onRowClick={(row: SelectBookingWithReservations) => {
          setInitialValues(row);
          setIsEditModalOpen(true);
          setIsDeleteModalOpen(false);
        }}
        type={type}
      />
      {!!initialValues && (
        <EditBookingModal
          companies={companies}
          nationalities={nationalities}
          tours={tours}
          nileCruises={nileCruises}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          type={type}
        />
      )}
      {!!initialValues && (
        <DeleteBookingModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          bookingId={initialValues.id}
          setInitialValues={setInitialValues}
        />
      )}
    </div>
  );
}
