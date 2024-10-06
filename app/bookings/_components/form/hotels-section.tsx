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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ChevronsUpDown } from "lucide-react";
import { formSchema } from "@/utils/zod-schema";
import { useState } from "react";
import { SelectHotels, SelectNileCruises } from "@/drizzle/schema";
import capitalize from "@/utils/capitalize";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function HotelsSection({
  form,
  citiesHotels,
  nileCruises,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  citiesHotels?: SelectHotels[];
  nileCruises: SelectNileCruises[];
}) {
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [nileCruiseOpen, setNileCruiseOpen] = useState(false);

  return (
    <section>
      <h2 className="pb-2 text-2xl font-semibold text-sky-900">Hotels</h2>
      <div className="grid grid-cols-4 gap-x-8 gap-y-8">
        <FormField
          control={form.control}
          name="hotels"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel className="block">Hotels</FormLabel>
              <Popover open={hotelsOpen} onOpenChange={setHotelsOpen}>
                <PopoverTrigger asChild disabled={!citiesHotels?.length}>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={hotelsOpen}
                    className="w-full justify-between overflow-hidden whitespace-nowrap"
                  >
                    {field.value?.length
                      ? field.value?.map((hotel) =>
                          capitalize(`${hotel.name}, `),
                        )
                      : "Select hotels"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className=" p-0">
                  <Command>
                    <CommandInput placeholder="Search hotel..." />
                    <CommandEmpty>No hotel found.</CommandEmpty>
                    <CommandGroup>
                      {citiesHotels?.map((props) => (
                        <CommandItem key={props.id}>
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={
                                  field.value?.findIndex(
                                    (hotel) => hotel.name === props.name,
                                  ) !== -1
                                }
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, props])
                                    : field.onChange(
                                        field.value?.filter(
                                          (hotel) => hotel.name !== props.name,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {props.name}
                            </FormLabel>
                          </FormItem>
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
        <FormField
          control={form.control}
          name="nileCruises"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel className="block">Nile Cruises</FormLabel>
              <Popover open={nileCruiseOpen} onOpenChange={setNileCruiseOpen}>
                <PopoverTrigger asChild disabled={!nileCruises?.length}>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={nileCruiseOpen}
                    className="w-full justify-between overflow-hidden"
                  >
                    {field.value?.length
                      ? field.value?.map((hotel) => capitalize(`${hotel}, `))
                      : "Select a nile cruises"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className=" p-0">
                  <Command>
                    <CommandInput placeholder="Search hotel..." />
                    <CommandEmpty>No nile cruise found.</CommandEmpty>
                    <CommandGroup>
                      {nileCruises?.map(({ id, name }) => (
                        <CommandItem key={id}>
                          <FormField
                            control={form.control}
                            name="nileCruises"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={name}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        name ?? "",
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value ?? []),
                                              name,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== name,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
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
        <FormField
          control={form.control}
          name="singleRoom"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Single room</FormLabel>
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
        <FormField
          control={form.control}
          name="doubleRoom"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Double room</FormLabel>
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
        <FormField
          control={form.control}
          name="tripleRoom"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Triple room</FormLabel>
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
        <FormField
          control={form.control}
          name="roomNote"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Rooms note</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
