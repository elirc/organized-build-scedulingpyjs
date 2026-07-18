import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { calendarService } from "../calendar/calendar.service.js";
import { availabilityService } from "../availability/availability.service.js";
import { staffService } from "./staff.service.js";

export const staffController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const result = await staffService.list(req.query);
    res.json(result);
  },
  async create(req: AuthenticatedRequest, res: Response) {
    const staff = await staffService.create(req.user?.id, req.body);
    res.status(201).json({ staff });
  },
  async getById(req: AuthenticatedRequest, res: Response) {
    const staff = await staffService.getById(req.params.id);
    res.json({ staff });
  },
  async update(req: AuthenticatedRequest, res: Response) {
    const staff = await staffService.update(req.user?.id, req.params.id, req.body);
    res.json({ staff });
  },
  async remove(req: AuthenticatedRequest, res: Response) {
    const staff = await staffService.remove(req.user?.id, req.params.id);
    res.json({ staff });
  },
  async calendar(req: AuthenticatedRequest, res: Response) {
    const calendar = await calendarService.getWeekView({
      staffId: req.params.id,
      startDate: String(req.query.startDate ?? new Date().toISOString().slice(0, 10)),
      timezone: String(req.query.timezone ?? "UTC")
    });
    res.json(calendar);
  },
  async availability(req: AuthenticatedRequest, res: Response) {
    const result = await availabilityService.listByStaff(req.params.id);
    res.json(result);
  }
};

