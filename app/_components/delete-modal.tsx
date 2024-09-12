"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader } from "lucide-react";
import { useDeleteModal } from "@/context/delete-modal-context";

export default function DeleteModal({
  title,
  children,
  onDelete,
}: {
  title: string;
  children: React.ReactNode;
  onDelete: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { isDeleteModalOpen, setIsDeleteModalOpen, closeDeleteModal } =
    useDeleteModal();

  async function handleDelete() {
    setIsLoading(true);
    await onDelete();
    closeDeleteModal();
    setIsLoading(false);
  }

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter className="pt-4">
          <Button type="button" variant={"outline"}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            className="flex gap-x-1"
            onClick={handleDelete}
          >
            {isLoading && <Loader size={14} className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
