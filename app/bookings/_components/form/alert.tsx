import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AlertModal({
  isOpen,
  setIsOpen,
  generateReservations,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  generateReservations: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-screen gap-y-2 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Reservations</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="text-gray-500">
            This will regenerate the reservations table and all the adjustments
            you have made will be removed
          </p>
        </DialogDescription>
        <DialogFooter className="flex w-full justify-between pt-4">
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => {
              generateReservations();
              setIsOpen(false);
            }}
          >
            Generate
          </Button>
          <div className="flex gap-x-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
