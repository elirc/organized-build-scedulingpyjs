import { z } from "zod";

export const availabilityIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const createAvailabilitySchema = z.object({
  body: z.object({
    staffId: z.string().min(1),
    type: z.enum(["AVAILABLE", "BLOCKED"]).default("AVAILABLE"),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTimeLocal: z.string().optional(),
    endTimeLocal: z.string().optional(),
    startDateUtc: z.string().datetime().optional(),
    endDateUtc: z.string().datetime().optional(),
    timezone: z.string().min(1),
    isRecurringWeekly: z.boolean().default(false)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    type: z.enum(["AVAILABLE", "BLOCKED"]).optional(),
    dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
    startTimeLocal: z.string().nullable().optional(),
    endTimeLocal: z.string().nullable().optional(),
    startDateUtc: z.string().datetime().nullable().optional(),
    endDateUtc: z.string().datetime().nullable().optional(),
    timezone: z.string().min(1).optional(),
    isRecurringWeekly: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const listAvailabilityByStaffSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    staffId: z.string().min(1)
  }),
  query: z.object({}).default({})
});

