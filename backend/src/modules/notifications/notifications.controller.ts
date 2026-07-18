import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(_req: AuthenticatedRequest, res: Response) {
    res.json(await notificationsService.list());
  },
  async enqueue(_req: AuthenticatedRequest, res: Response) {
    const count = await notificationsService.enqueuePendingNotifications();
    res.json({ queued: count });
  }
};

