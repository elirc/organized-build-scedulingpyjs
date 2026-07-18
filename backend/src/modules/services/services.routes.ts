import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { servicesController } from "./services.controller.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { Role } from "@prisma/client";
import { validate } from "../../middleware/validate.middleware.js";
import {
  assignStaffSchema,
  createServiceSchema,
  listServicesSchema,
  serviceIdSchema,
  updateServiceSchema
} from "./services.schemas.js";

export const servicesRouter = Router();

servicesRouter.get("/", validate(listServicesSchema), asyncHandler(servicesController.list));
servicesRouter.post("/", requireRole(Role.MANAGER), validate(createServiceSchema), asyncHandler(servicesController.create));
servicesRouter.get("/:id", validate(serviceIdSchema), asyncHandler(servicesController.getById));
servicesRouter.patch("/:id", requireRole(Role.MANAGER), validate(updateServiceSchema), asyncHandler(servicesController.update));
servicesRouter.delete("/:id", requireRole(Role.MANAGER), validate(serviceIdSchema), asyncHandler(servicesController.remove));
servicesRouter.post("/:id/assign-staff", requireRole(Role.MANAGER), validate(assignStaffSchema), asyncHandler(servicesController.assignStaff));
