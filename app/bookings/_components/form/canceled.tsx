import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formSchema } from "@/utils/zod-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export default function Canceled({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  return (
    <section>
      <h2 className="pb-2 text-2xl font-semibold text-sky-900">Canceled</h2>
      <div className="grid grid-cols-4 gap-x-8 gap-y-8">
        <FormField
          control={form.control}
          name="creditBalance"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <FormLabel>Credit Balance</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a credit balance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Future business", "Refund"]?.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paid"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-start">
              <div className="space-y-0.5">
                <FormLabel>Paid</FormLabel>
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
      </div>
    </section>
  );
}
