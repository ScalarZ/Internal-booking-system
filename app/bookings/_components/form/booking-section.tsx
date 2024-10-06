"use client";

import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  File,
  Plus,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import UploadImage from "../upload-image";
import { formSchema } from "@/utils/zod-schema";
import { useState } from "react";
import { SelectCompanies, SelectNationalities } from "@/drizzle/schema";
import ForPage from "../for-page";
import { usePathname } from "next/navigation";

export default function BookingSection({
  form,
  companies,
  nationalities,
  name,
  touristsNames,
  passports,
  setPassports,
  setTouristsNames,
  setName,
  setInternalBookingId,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  companies: SelectCompanies[];
  nationalities: SelectNationalities[];
  name: string;
  touristsNames: string[];
  passports: Passport[];
  setPassports: (passports: Passport[]) => void;
  setTouristsNames: (cb: (names: string[]) => string[]) => void;
  setName: (name: string) => void;
  setInternalBookingId: (id: string) => void;
}) {
  const pathname = usePathname();
  const [companyOpen, setCompanyOpen] = useState(false);
  const forPageProps =
    pathname === "/bookings"
      ? { type: "single" as const, page: "/bookings" }
      : { readonly: true };

  return (
    <section>
      <h2 className="pb-2 text-2xl font-semibold text-sky-900">Booking</h2>
      <div className="grid grid-cols-4 gap-x-8 gap-y-8">
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <div className="space-y-0.5">
                  <FormLabel>Status</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel className="block">Company</FormLabel>
                <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={companyOpen}
                      className="w-full justify-between overflow-hidden"
                      type="button"
                    >
                      {field.value ? field.value : "Select a company"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0">
                    <Command>
                      <CommandInput placeholder="Search company..." />
                      <CommandEmpty>No company found.</CommandEmpty>
                      <CommandGroup>
                        {companies?.map(({ id, name, companyId }) => (
                          <CommandItem
                            key={id}
                            value={name ?? ""}
                            onSelect={() => {
                              field.onChange(name === field.value ? "" : name);
                              setCompanyOpen(false);
                              const id = `${companyId ?? ""}-${(
                                Math.random() * 36
                              )
                                .toString(36)
                                .substring(2, 7)}`.toUpperCase();
                              form.setValue(
                                "internalBookingId",
                                name === field.value ? "" : id,
                              );
                              setInternalBookingId(
                                name === field.value ? "" : id,
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="internalBookingId"
            disabled
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Internal Booking ID</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormDescription className="flex gap-x-2">
                  Generated when selecting a company
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="referenceBookingId"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Reference Booking ID</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Nationality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nationality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nationalities?.map(({ name, id }) => (
                      <SelectItem key={id} value={name ?? ""}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "Spanish",
                      "Portuguese",
                      "English",
                      "French",
                      "Italian",
                    ]?.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="arrivalDepartureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Arrival ⟹ Departure</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "whitespace-pre-line pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        type="button"
                      >
                        {field.value?.from && field.value?.to ? (
                          `${format(field.value.from, "PPP")} ⟹ ${format(field.value.to, "PPP")}`
                        ) : (
                          <span>Pick a range</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: field.value?.from,
                        to: field.value?.to,
                      }}
                      onSelect={(value) => {
                        field.onChange({
                          from: value?.from
                            ? new Date(format(value.from, "yyyy-MM-dd"))
                            : undefined,
                          to: value?.to
                            ? new Date(format(value.to, "yyyy-MM-dd"))
                            : undefined,
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="pax"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>PAX</FormLabel>
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
        </ForPage>
        <ForPage {...forPageProps}>
          <FormItem className="flex flex-col justify-start">
            <FormLabel>Tourist names</FormLabel>
            <div className="flex gap-x-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={
                  !form.watch("pax") ||
                  touristsNames?.length >= form.watch("pax")
                }
              />
              <Button
                type="button"
                variant="secondary"
                disabled={
                  !name ||
                  !form.watch("pax") ||
                  touristsNames?.length >= form.watch("pax")
                }
                onClick={() => {
                  setTouristsNames((prev) => [...prev, name]);
                  setName("");
                }}
                className="flex gap-x-1"
              >
                <Plus size={16} />
                Add
              </Button>
            </div>
            <FormDescription className="flex gap-x-2">
              This fields depends on the PAX number
              <span>
                {touristsNames?.length}/
                {!isNaN(form.watch("pax")) ? form.watch("pax") : 0}
              </span>
            </FormDescription>
            <div>
              <ul className="flex flex-wrap gap-2 p-2 text-white">
                {touristsNames?.map((name, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-x-1 rounded-full bg-neutral-900 px-2 py-1 text-sm font-medium"
                  >
                    {name}
                    <XCircle
                      size={18}
                      className="cursor-pointer"
                      onClick={() =>
                        setTouristsNames((prev) =>
                          prev.filter((_, index) => index != i),
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
            <FormMessage />
          </FormItem>
        </ForPage>
        <FormField
          control={form.control}
          name="roomingList"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Rooming List</FormLabel>
              <FormControl>
                <div className="flex items-center gap-x-1">
                  <ForPage {...forPageProps}>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        field.onChange({
                          file: e.target.files?.[0],
                          url: URL.createObjectURL(e.target.files?.[0]),
                        })
                      }
                    />
                  </ForPage>
                  {field.value?.url && (
                    <div className="relative">
                      <a href={field.value.url}>
                        <File size={28} strokeWidth={1.5} />
                      </a>
                      <ForPage type="single" page="/bookings">
                        <XCircle
                          size={16}
                          className="absolute -right-2 -top-2 cursor-pointer text-gray-500 hover:text-red-500"
                          onClick={() =>
                            field.onChange({ file: undefined, url: undefined })
                          }
                        />
                      </ForPage>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <UploadImage
          title="Upload Tourists Passports"
          images={passports}
          setImages={setPassports}
          maxNumber={form.watch("pax")}
          button={
            <Button type="button" variant="secondary" className="mt-5">
              Upload Passports
            </Button>
          }
        />
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="visa"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <div className="space-y-0.5">
                  <FormLabel>Visa included?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="tipsIncluded"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <div className="space-y-0.5">
                  <FormLabel>Tips included?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="tips"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Tips</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
        <ForPage {...forPageProps}>
          <FormField
            control={form.control}
            name="generalNote"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>General note</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ForPage>
      </div>
    </section>
  );
}
