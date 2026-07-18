import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async summary(_req: AuthenticatedRequest, res: Response) {
    res.json(await dashboardService.getSummary());
  },
  async appointmentsByStatus(_req: AuthenticatedRequest, res: Response) {
    res.json(await dashboardService.getAppointmentsByStatus());
  },
  async staffUtilization(_req: AuthenticatedRequest, res: Response) {
    res.json(await dashboardService.getStaffUtilization());
  },
  async upcomingAppointments(_req: AuthenticatedRequest, res: Response) {
    res.json(await dashboardService.getUpcomingAppointments());
  },
  async cancellationRate(_req: AuthenticatedRequest, res: Response) {
    res.json(await dashboardService.getCancellationRate());
  }
};

