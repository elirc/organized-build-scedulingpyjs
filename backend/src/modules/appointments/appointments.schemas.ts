import { z } from "zod";

export const bookAppointmentSchema = z.object({
  body: z.object({
    customerId: z.string().min(1),
    staffId: z.string().min(1),
    serviceId: z.string().min(1),
    startTimeLocal: z.string().min(1),
    timezone: z.string().min(1),
    source: z.enum(["CUSTOMER_PORTAL", "ADMIN_BOOKING", "STAFF_BOOKING", "SYSTEM_GENERATED"]).default("CUSTOMER_PORTAL")
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const appointmentIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    timezone: z.string().optional(),
    cancellationReason: z.string().optional()
  }).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const cancelAppointmentSchema = z.object({
  body: z.object({
    reason: z.string().min(1)
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const rescheduleAppointmentSchema = z.object({
  body: z.object({
    startTimeLocal: z.string().min(1),
    timezone: z.string().min(1)
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const createRecurringAppointmentsSchema = z.object({
  body: z.object({
    customerId: z.string().min(1),
    staffId: z.string().min(1),
    serviceId: z.string().min(1),
    firstStartTimeLocal: z.string().min(1),
    timezone: z.string().min(1),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    interval: z.number().int().positive().default(1),
    count: z.number().int().positive().max(52).optional(),
    untilDateUtc: z.string().datetime().optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const recurrenceSeriesIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});
