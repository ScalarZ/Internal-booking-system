import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import ForPage from "../for-page";
import DomesticFlights from "./domestic-flights";
import InternationalFlights from "./international-flights";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/utils/zod-schema";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

export function FlightsSection({
  form,
  domesticFlights,
  internationalFlights,
  modalMode,
  pathname,
  setDomesticFlights,
  setInternationalFlights,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  pathname: string;
  internationalFlights: (InternationalFlights & {
    src?: string;
  })[];
  modalMode: "add" | "edit";
  setInternationalFlights: (
    cb: (values: InternationalFlights[]) => InternationalFlights[],
  ) => void;
  domesticFlights: (DomesticFlights & {
    src?: string;
  })[];
  setDomesticFlights: (
    cb: (values: DomesticFlights[]) => DomesticFlights[],
  ) => void;
}) {
  return (
    <section className="space-y-4">
      <ForPage
        {...(pathname === "/bookings"
          ? { type: "single", page: "/bookings" }
          : { readonly: true })}
      >
        <h2 className="text-2xl font-semibold text-sky-900">Flights</h2>
        <InternationalFlights
          modalMode={modalMode}
          internationalFlights={internationalFlights}
          setInternationalFlights={setInternationalFlights}
        />
      </ForPage>
      <ForPage
        {...(["/bookings", "/aviations"].includes(pathname)
          ? { type: "multiple", page: ["/bookings", "/aviations"] }
          : { readonly: true })}
      >
        <DomesticFlights
          modalMode={modalMode}
          domesticFlights={domesticFlights}
          setDomesticFlights={setDomesticFlights}
        />
        <FormField
          control={form.control}
          name="flightsGeneralNote"
          render={({ field }) => (
            <FormItem className="mt-4 flex flex-col justify-start">
              <FormLabel>Flights General Note</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </ForPage>
    </section>
  );
}
