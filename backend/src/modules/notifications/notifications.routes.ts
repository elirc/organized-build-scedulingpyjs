import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { notificationsController } from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireRole(Role.MANAGER), asyncHandler(notificationsController.list));
notificationsRouter.post("/enqueue", requireRole(Role.MANAGER), asyncHandler(notificationsController.enqueue));

