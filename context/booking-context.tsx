"use client";

import { Bookings, SelectBookingOptionalTours } from "@/drizzle/schema";
import { getBooking } from "@/utils/db-queries/booking";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";

interface BookingContextType {
  booking:
    | (Bookings & { optionalTour?: SelectBookingOptionalTours })
    | undefined;
  setBooking: (booking: Bookings | undefined) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (value: boolean) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (value: boolean) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );
  const bookingId = params.get("bookingId");

  const { data, error } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => (bookingId ? await getBooking(bookingId) : null),
  });
  const [booking, setBooking] = useState<Bookings | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(!!booking);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setBooking(undefined);
    params.delete("bookingId");
    router.replace(`?${params.toString()}`);
  }, [params, router]);

  useEffect(() => {
    if (!data) return;
    setBooking(data as Bookings);
    setIsEditModalOpen(true);
  }, [data]);
  const value = {
    booking,
    setBooking,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    closeModal,
  };
  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
