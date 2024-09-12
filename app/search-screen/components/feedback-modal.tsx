import { Loader } from "@/app/_components/loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useUploadFiles from "@/hooks/use-upload-files";
import { getRepresentatives } from "@/utils/db-queries/representatives";
import { feedbackSchema } from "@/utils/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FilesList from "../../bookings/_components/files-list";
import CustomSelect from "./common/custom-select";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";
import { useBooking } from "@/context/booking-context";
import { addReview, addSurvey } from "@/utils/db-queries/booking";

type ReviewSchema = z.infer<typeof feedbackSchema>;

export default function SurveyReviewModal({
  type,
}: {
  type: "survey" | "review";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={"secondary"} onClick={() => setIsOpen(true)}>
        Add {type}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">Add {type}</DialogTitle>
        </DialogHeader>
        <FromContainer
          type={type}
          handleLoading={(value: boolean) => setIsLoading(value)}
          onSubmitComplete={() => setIsOpen(false)}
        >
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex gap-x-1">
              {isLoading && <Loader size={14} className="animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </FromContainer>
      </DialogContent>
    </Dialog>
  );
}

function FromContainer({
  type,
  children,
  handleLoading,
  onSubmitComplete,
}: {
  type: "survey" | "review";
  children?: React.ReactNode;
  handleLoading: (value: boolean) => void;
  onSubmitComplete?: () => void;
}) {
  const { uploadedFiles, handleFileUpload, removeFile } = useUploadFiles();
  const { uploadFiles } = useSupabaseStorage(type + "s");
  const { booking } = useBooking();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      representatives: [],
    },
  });

  const { data: representatives, isLoading: isLoadingRepresentatives } =
    useQuery({
      queryKey: ["representatives"],
      queryFn: async () => await getRepresentatives(),
    });

  async function onSubmit(values: ReviewSchema) {
    if (!booking) return;
    try {
      const files = await uploadFiles(uploadedFiles.map(({ file }) => file));
      if (type === "survey")
        await addSurvey({
          ...values,
          bookingId: booking?.id,
          files,
        });

      if (type === "review")
        await addReview({
          ...values,
          bookingId: booking?.id,
          files,
        });
    } catch (err) {
      console.error(err);
    }
    onSubmitComplete?.();
  }

  useEffect(() => {
    handleLoading(form.formState.isSubmitting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isSubmitting]);

  if (isLoadingRepresentatives) return <div>Loading</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="representatives"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel className="block">Representatives</FormLabel>
              <CustomSelect
                disabled={!representatives?.length}
                title={"Select representatives"}
                items={field.value}
                removeItem={(id) =>
                  field.onChange(
                    field.value?.filter((value) => value.id !== id),
                  )
                }
                icon={
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                }
                triggerWrapper={FormControl}
              >
                <Command>
                  <CommandInput placeholder="Search representatives..." />
                  <CommandEmpty>No representatives found.</CommandEmpty>
                  <CommandList>
                    {representatives?.map((props) => (
                      <CommandItem
                        key={props.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <Checkbox
                          checked={
                            field.value?.findIndex(
                              (value) => value.name === props.name,
                            ) !== -1
                          }
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, props])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value.name !== props.name,
                                  ),
                                );
                          }}
                        />
                        <span className="font-normal">{props.name}</span>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </CustomSelect>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel className="block">Files</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    field.onChange(e.target.files);
                    handleFileUpload(e.target.files);
                  }}
                />
              </FormControl>
              <FormDescription>
                You can upload multiple files (pdf, images)
              </FormDescription>
              <FilesList
                uploadedFiles={uploadedFiles}
                removeFile={removeFile}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}
