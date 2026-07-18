import { z } from "zod";

export const listUsersSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional()
  }).default({})
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(["SYSTEM_ADMIN", "MANAGER", "SCHEDULER", "STAFF", "CUSTOMER", "READ_ONLY"]),
    isActive: z.boolean().default(true)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const userIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    role: z.enum(["SYSTEM_ADMIN", "MANAGER", "SCHEDULER", "STAFF", "CUSTOMER", "READ_ONLY"]).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).default({})
});

