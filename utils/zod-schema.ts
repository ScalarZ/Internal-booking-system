import { z } from "zod";

export const citySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  countryId: z.string().nullable(),
});

export const countrySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
});

export const activitySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  countryId: z.string().nullable(),
  cityId: z.string().nullable(),
  isOptional: z.boolean().default(false),
});

export const formSchema = z.object({
  pax: z.number({ required_error: "Please enter a number" }).min(1),
  internalBookingId: z
    .string({
      required_error: "Please enter an internal booking id",
    })
    .optional(),
  referenceBookingId: z.string().optional(),
  tour: z.object(
    {
      id: z.string().optional(),
      name: z.string().optional(),
    },
    { required_error: "Please select a tour" },
  ),
  company: z.string({ required_error: "Please select a company" }),
  currency: z.string({ required_error: "Please select a currency" }),
  arrivalDepartureDate: z.object({
    from: z
      .date({ required_error: "Please select an arrival date" })
      .optional(),
    to: z
      .date({ required_error: "Please select an departure date" })
      .optional(),
  }),
  hotels: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Please select at least one hotel.",
  }),
  nileCruises: z.array(z.string()).optional(),
  singleRoom: z.number().optional(),
  doubleRoom: z.number().optional(),
  tripleRoom: z.number().optional(),
  roomNote: z.string().optional(),
  internalFlights: z.boolean().default(false),
  internalFlightsNote: z.string().optional(),
  visa: z.boolean().default(false),
  tipsIncluded: z.boolean().default(false),
  tips: z.number({ required_error: "Please enter tips" }),
  nationality: z.string({ required_error: "Please select a nationality" }),
  language: z.string({ required_error: "Please select a language" }),
  generalNote: z.string().optional(),
  status: z.boolean().default(true),
  internationalFlights: z
    .object({
      flightNumber: z.number().optional(),
      arrivalDepartureDate: z
        .object({
          from: z
            .date({ required_error: "Please select an arrival date" })
            .optional(),
          to: z
            .date({ required_error: "Please select an departure date" })
            .optional(),
        })
        .optional(),
      destinations: z.string().optional(),
      file: z.string().optional(),
    })
    .optional(),
});
