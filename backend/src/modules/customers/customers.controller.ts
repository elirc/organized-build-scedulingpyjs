import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { appointmentsService } from "../appointments/appointments.service.js";
import { customersService } from "./customers.service.js";

export const customersController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const result = await customersService.list(req.query);
    res.json(result);
  },
  async create(req: AuthenticatedRequest, res: Response) {
    const customer = await customersService.create(req.user?.id, req.body);
    res.status(201).json({ customer });
  },
  async getById(req: AuthenticatedRequest, res: Response) {
    const customer = await customersService.getById(req.params.id);
    res.json({ customer });
  },
  async update(req: AuthenticatedRequest, res: Response) {
    const customer = await customersService.update(req.user?.id, req.params.id, req.body);
    res.json({ customer });
  },
  async remove(req: AuthenticatedRequest, res: Response) {
    const customer = await customersService.remove(req.user?.id, req.params.id);
    res.json({ customer });
  },
  async appointments(req: AuthenticatedRequest, res: Response) {
    const appointments = await appointmentsService.listForCustomer(req.params.id);
    res.json({ appointments });
  }
};

