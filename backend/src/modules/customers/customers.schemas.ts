import { z } from "zod";

export const listCustomersSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional()
  }).default({})
});

export const customerIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const createCustomerSchema = z.object({
  body: z.object({
    userId: z.string().min(1).optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    timezone: z.string().optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().nullable().optional(),
    timezone: z.string().nullable().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

