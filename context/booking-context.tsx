"use client";

import { Bookings, SelectBookingOptionalTours } from "@/drizzle/schema";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
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
  const [booking, setBooking] = useState<Bookings | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setBooking(undefined)
  }, []);
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
