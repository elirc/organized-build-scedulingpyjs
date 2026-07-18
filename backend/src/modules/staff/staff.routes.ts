import { Router } from "express";
import { Role } from "@prisma/client";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { staffController } from "./staff.controller.js";
import { createStaffSchema, listStaffSchema, staffIdSchema, updateStaffSchema } from "./staff.schemas.js";

export const staffRouter = Router();

staffRouter.get("/", requireRole(Role.STAFF), validate(listStaffSchema), asyncHandler(staffController.list));
staffRouter.post("/", requireRole(Role.MANAGER), validate(createStaffSchema), asyncHandler(staffController.create));
staffRouter.get("/:id", requireRole(Role.STAFF), validate(staffIdSchema), asyncHandler(staffController.getById));
staffRouter.patch("/:id", requireRole(Role.MANAGER), validate(updateStaffSchema), asyncHandler(staffController.update));
staffRouter.delete("/:id", requireRole(Role.MANAGER), validate(staffIdSchema), asyncHandler(staffController.remove));
staffRouter.get("/:id/calendar", requireRole(Role.STAFF), validate(staffIdSchema), asyncHandler(staffController.calendar));
staffRouter.get("/:id/availability", requireRole(Role.STAFF), validate(staffIdSchema), asyncHandler(staffController.availability));
