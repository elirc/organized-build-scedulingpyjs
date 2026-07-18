import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const result = await usersService.list(req.query);
    res.json(result);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const user = await usersService.create(req.user?.id, req.body);
    res.status(201).json({ user });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const user = await usersService.getById(req.params.id);
    res.json({ user });
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const user = await usersService.update(req.user?.id, req.params.id, req.body);
    res.json({ user });
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const user = await usersService.remove(req.user?.id, req.params.id);
    res.json({ user });
  }
};

