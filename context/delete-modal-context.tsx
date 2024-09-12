"use client";

import { createContext, useState, useContext, ReactNode } from "react";

interface DeleteModalContext {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
}

const DeleteModalContext = createContext<DeleteModalContext | undefined>(
  undefined,
);

export const useDeleteModal = () => {
  const context = useContext(DeleteModalContext);
  if (context === undefined) {
    throw new Error("useDeleteModal must be used within a DeleteModalProvider");
  }
  return context;
};

interface DeleteModalProviderProps {
  children: ReactNode;
}

export const DeleteModalProvider: React.FC<DeleteModalProviderProps> = ({
  children,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  function openDeleteModal() {
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
  }
  const value = {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
  };
  return (
    <DeleteModalContext.Provider value={value}>
      {children}
    </DeleteModalContext.Provider>
  );
};
