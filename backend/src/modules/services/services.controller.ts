import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { servicesService } from "./services.service.js";

export const servicesController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const result = await servicesService.list(req.query);
    res.json(result);
  },
  async create(req: AuthenticatedRequest, res: Response) {
    const service = await servicesService.create(req.user?.id, req.body);
    res.status(201).json({ service });
  },
  async getById(req: AuthenticatedRequest, res: Response) {
    const service = await servicesService.getById(req.params.id);
    res.json({ service });
  },
  async update(req: AuthenticatedRequest, res: Response) {
    const service = await servicesService.update(req.user?.id, req.params.id, req.body);
    res.json({ service });
  },
  async remove(req: AuthenticatedRequest, res: Response) {
    const service = await servicesService.remove(req.user?.id, req.params.id);
    res.json({ service });
  },
  async assignStaff(req: AuthenticatedRequest, res: Response) {
    const assignment = await servicesService.assignStaff(req.user?.id, req.params.id, req.body.staffId);
    res.json({ assignment });
  }
};

