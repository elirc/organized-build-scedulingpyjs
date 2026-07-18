import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireRole(Role.MANAGER), asyncHandler(dashboardController.summary));
dashboardRouter.get("/appointments-by-status", requireRole(Role.MANAGER), asyncHandler(dashboardController.appointmentsByStatus));
dashboardRouter.get("/staff-utilization", requireRole(Role.MANAGER), asyncHandler(dashboardController.staffUtilization));
dashboardRouter.get("/upcoming-appointments", requireRole(Role.STAFF), asyncHandler(dashboardController.upcomingAppointments));
dashboardRouter.get("/cancellation-rate", requireRole(Role.MANAGER), asyncHandler(dashboardController.cancellationRate));

