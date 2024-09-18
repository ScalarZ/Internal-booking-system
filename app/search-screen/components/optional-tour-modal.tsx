import { Loader } from "@/app/_components/loader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUploadFiles from "@/hooks/use-upload-files";
import {
  getActivities,
  getOptionalActivities,
} from "@/utils/db-queries/activity";
import { getRepresentatives } from "@/utils/db-queries/representatives";
import { optionalTourSchema } from "@/utils/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ChevronsUpDown, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import FilesList from "../../bookings/_components/files-list";
import CustomSelect from "./common/custom-select";
import CostumePopover from "./common/custom-popover";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";
import { addBookingOptionalTour } from "@/utils/db-queries/booking";
import { useBooking } from "@/context/booking-context";

type OptionalTourModalSchema = z.infer<typeof optionalTourSchema>;

export default function OptionalTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant={"secondary"} onClick={() => setIsOpen(true)}>
        Add optional tour
      </Button>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Optional Tour</DialogTitle>
        </DialogHeader>
        <FromContainer
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
  children,
  handleLoading,
  onSubmitComplete,
}: {
  children?: React.ReactNode;
  handleLoading: (value: boolean) => void;
  onSubmitComplete?: () => void;
}) {
  const { uploadedFiles, handleFileUpload, removeFile } = useUploadFiles();
  const { uploadFiles } = useSupabaseStorage("optional_tours");
  const { booking } = useBooking();

  const form = useForm<z.infer<typeof optionalTourSchema>>({
    resolver: zodResolver(optionalTourSchema),
    defaultValues: {
      representatives: [],
      optionalActivities: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "optionalActivities",
  });

  const { data: representatives, isLoading: isLoadingRepresentatives } =
    useQuery({
      queryKey: ["representatives"],
      queryFn: async () => await getRepresentatives(),
    });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["optional-activities"],
    queryFn: async () => await getOptionalActivities(),
  });
  async function onSubmit(values: OptionalTourModalSchema) {
    if (!booking) return;
    try {
      const files = await uploadFiles(uploadedFiles.map(({ file }) => file));
      await addBookingOptionalTour({
        ...values,
        bookingId: booking.id,
        files,
      });
    } catch (error) {
      console.error(error);
    }
    onSubmitComplete?.();
  }

  useEffect(() => {
    handleLoading(form.formState.isSubmitting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isSubmitting]);

  if (isLoadingRepresentatives || isLoadingActivities)
    return <div>Loading</div>;

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
        <FormItem className="flex flex-col justify-start">
          <FormLabel className="block">Activities</FormLabel>
          <CustomSelect
            disabled={!activities?.length}
            title={"Select activities"}
            icon={
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            }
            triggerWrapper={FormControl}
          >
            <Command>
              <CommandInput placeholder="Search activities..." />
              <CommandEmpty>No activities found.</CommandEmpty>
              <CommandList>
                {activities?.map((props) => (
                  <CommandItem
                    key={props.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <Checkbox
                      checked={
                        fields?.findIndex(
                          (value) => value.name === props.name,
                        ) !== -1
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          append(props);
                          return;
                        }
                        remove(
                          fields.findIndex(
                            (activity) => activity.name === props.name,
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
        </FormItem>
        {fields.map((props, i) => (
          <div key={props.id} className="flex gap-x-2">
            <FormField
              control={form.control}
              name={`optionalActivities.${i}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block">Name</FormLabel>
                  <Input defaultValue={field.value ?? ""} readOnly />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`optionalActivities.${i}.date`}
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel className="block">Date</FormLabel>
                  <CostumePopover
                    disabled={!activities?.length}
                    title={
                      field.value
                        ? `${format(field.value, "PPP")}`
                        : "Pick a date"
                    }
                    icon={
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    }
                    triggerWrapper={FormControl}
                  >
                    <Calendar
                      selected={field.value}
                      onDayClick={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </CostumePopover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <XCircle
              className="translate-y-7 cursor-pointer text-gray-400 hover:text-red-500"
              onClick={() => remove(i)}
            />
          </div>
        ))}
        <FormField
          control={form.control}
          name="pax"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel className="block">PAX</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  value={Math.max(field.value, 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["USD", "EUR", "EGP"]?.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel className="block">Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  value={Math.max(field.value, 0)}
                />
              </FormControl>
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
