import { z } from "zod";

export const listServicesSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional()
  }).default({})
});

export const serviceIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    durationMinutes: z.number().int().positive(),
    bufferBeforeMinutes: z.number().int().min(0).default(0),
    bufferAfterMinutes: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    durationMinutes: z.number().int().positive().optional(),
    bufferBeforeMinutes: z.number().int().min(0).optional(),
    bufferAfterMinutes: z.number().int().min(0).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const assignStaffSchema = z.object({
  body: z.object({
    staffId: z.string().min(1)
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

