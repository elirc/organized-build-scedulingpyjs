import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.json(tokens);
  },

  async logout(req: Request, res: Response) {
    const result = await authService.logout(req.body.refreshToken);
    res.json(result);
  },

  async me(req: AuthenticatedRequest, res: Response) {
    res.json({ user: req.user ?? null });
  }
};
