import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { calendarService } from "./calendar.service.js";

export const calendarController = {
  async day(req: AuthenticatedRequest, res: Response) {
    const result = await calendarService.getDayView({
      staffId: req.query.staffId as string | undefined,
      startDate: String(req.query.startDate),
      timezone: String(req.query.timezone)
    });
    res.json(result);
  },
  async week(req: AuthenticatedRequest, res: Response) {
    const result = await calendarService.getWeekView({
      staffId: req.query.staffId as string | undefined,
      startDate: String(req.query.startDate),
      timezone: String(req.query.timezone)
    });
    res.json(result);
  },
  async month(req: AuthenticatedRequest, res: Response) {
    const result = await calendarService.getMonthView({
      staffId: req.query.staffId as string | undefined,
      startDate: String(req.query.startDate),
      timezone: String(req.query.timezone)
    });
    res.json(result);
  }
};

