import type { Response } from "express";
import { appointmentsService } from "./appointments.service.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export const appointmentsController = {
  async list(_req: AuthenticatedRequest, res: Response) {
    const appointments = await appointmentsService.list();
    res.json({ appointments });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const appointment = await appointmentsService.getById(req.params.id);
    res.json({ appointment });
  },

  async book(req: AuthenticatedRequest, res: Response) {
    const appointment = await appointmentsService.book({
      ...req.body,
      source: req.body.source,
      createdById: req.user?.id
    });

    res.status(201).json({ appointment });
  },

  async cancel(req: AuthenticatedRequest, res: Response) {
    const appointment = await appointmentsService.cancel({
      id: req.params.id,
      actorId: req.user?.id,
      reason: req.body.reason
    });
    res.json({ appointment });
  },

  async reschedule(req: AuthenticatedRequest, res: Response) {
    const appointment = await appointmentsService.reschedule({
      id: req.params.id,
      actorId: req.user?.id,
      startTimeLocal: req.body.startTimeLocal,
      timezone: req.body.timezone
    });
    res.json({ appointment });
  },

  async complete(req: AuthenticatedRequest, res: Response) {
    const appointment = await appointmentsService.complete(req.params.id, req.user?.id);
    res.json({ appointment });
  },

  async noShow(req: AuthenticatedRequest, res: Response) {
    const appointment = await appointmentsService.markNoShow(req.params.id, req.user?.id);
    res.json({ appointment });
  },

  async activity(req: AuthenticatedRequest, res: Response) {
    const activities = await appointmentsService.getActivity(req.params.id);
    res.json({ activities });
  },

  async createRecurring(req: AuthenticatedRequest, res: Response) {
    const result = await appointmentsService.createRecurring({
      ...req.body,
      actorId: req.user?.id
    });
    res.status(201).json(result);
  },

  async getRecurrenceSeries(req: AuthenticatedRequest, res: Response) {
    const series = await appointmentsService.getRecurrenceSeries(req.params.id);
    res.json({ series });
  },

  async cancelRecurrenceSeries(req: AuthenticatedRequest, res: Response) {
    const series = await appointmentsService.cancelRecurrenceSeries(req.user?.id, req.params.id);
    res.json({ series });
  }
};
