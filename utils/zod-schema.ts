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
