import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { SelectSurveys } from "@/drizzle/schema";

import { DialogTitle } from "@radix-ui/react-dialog";
import { File } from "lucide-react";
import { useState } from "react";

export default function FeedbackViewModal({
  feedbacks,
  type,
}: {
  feedbacks: SelectSurveys[];
  type: "survey" | "review";
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={"secondary"} onClick={() => setIsOpen(true)}>
        View {type}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">View {type}</DialogTitle>
        </DialogHeader>
        <main className="flex flex-col gap-y-2">
          {feedbacks.length === 0 && (
            <p className="text-sm text-gray-500">No {type} found</p>
          )}
          {feedbacks.map(({ id, representatives, files }) => (
            <section key={id} className="flex flex-col">
              <div>
                <span className="mr-2 text-sm font-medium">
                  Representatives:
                </span>
                {representatives.map(({ id, name }) => (
                  <Badge key={id}>{name}</Badge>
                ))}
              </div>
              <div>
                <span className="text-sm font-medium">Files:</span>
                <ul className="flex flex-wrap gap-4">
                  {files?.map(({ url, name }) => (
                    <li key={name}>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <File size={28} strokeWidth={1.5} />
                        <p className="w-24   overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                          {name}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </main>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant={"outline"}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
