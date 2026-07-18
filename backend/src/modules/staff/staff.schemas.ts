import { z } from "zod";

export const listStaffSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional()
  }).default({})
});

export const createStaffSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    displayName: z.string().min(1),
    bio: z.string().optional(),
    timezone: z.string().min(1),
    isActive: z.boolean().default(true)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const staffIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const updateStaffSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).optional(),
    bio: z.string().nullable().optional(),
    timezone: z.string().min(1).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

