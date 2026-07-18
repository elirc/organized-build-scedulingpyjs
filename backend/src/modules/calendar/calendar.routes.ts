import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { calendarController } from "./calendar.controller.js";

export const calendarRouter = Router();

calendarRouter.get("/day", requireRole(Role.STAFF), asyncHandler(calendarController.day));
calendarRouter.get("/week", requireRole(Role.STAFF), asyncHandler(calendarController.week));
calendarRouter.get("/month", requireRole(Role.STAFF), asyncHandler(calendarController.month));

