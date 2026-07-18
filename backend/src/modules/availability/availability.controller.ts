import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { availabilityService } from "./availability.service.js";

export const availabilityController = {
  async list(_req: AuthenticatedRequest, res: Response) {
    res.json(await availabilityService.list());
  },
  async create(req: AuthenticatedRequest, res: Response) {
    const window = await availabilityService.create(req.user?.id, req.body);
    res.status(201).json({ window });
  },
  async listByStaff(req: AuthenticatedRequest, res: Response) {
    res.json(await availabilityService.listByStaff(req.params.staffId));
  },
  async update(req: AuthenticatedRequest, res: Response) {
    const window = await availabilityService.update(req.user?.id, req.params.id, req.body);
    res.json({ window });
  },
  async remove(req: AuthenticatedRequest, res: Response) {
    const window = await availabilityService.remove(req.user?.id, req.params.id);
    res.json({ window });
  }
};

