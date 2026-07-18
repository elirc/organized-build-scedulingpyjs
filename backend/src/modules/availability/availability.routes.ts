import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { generateAvailableSlots } from "./slotGeneration.service.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { availabilityController } from "./availability.controller.js";
import {
  availabilityIdSchema,
  createAvailabilitySchema,
  listAvailabilityByStaffSchema,
  updateAvailabilitySchema
} from "./availability.schemas.js";

const slotsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    serviceId: z.string().min(1),
    staffId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timezone: z.string().min(1)
  })
});

export const availabilityRouter = Router();

availabilityRouter.get("/", requireRole(Role.STAFF), asyncHandler(availabilityController.list));
availabilityRouter.post("/", requireRole(Role.STAFF), validate(createAvailabilitySchema), asyncHandler(availabilityController.create));
availabilityRouter.get("/staff/:staffId", requireRole(Role.STAFF), validate(listAvailabilityByStaffSchema), asyncHandler(availabilityController.listByStaff));
availabilityRouter.patch("/:id", requireRole(Role.STAFF), validate(updateAvailabilitySchema), asyncHandler(availabilityController.update));
availabilityRouter.delete("/:id", requireRole(Role.STAFF), validate(availabilityIdSchema), asyncHandler(availabilityController.remove));
availabilityRouter.get("/slots", validate(slotsSchema), asyncHandler(async (req, res) => {
  const slots = await generateAvailableSlots({
    prisma,
    serviceId: req.query.serviceId as string,
    staffId: req.query.staffId as string,
    date: req.query.date as string,
    timezone: req.query.timezone as string
  });

  res.json({ slots });
}));
