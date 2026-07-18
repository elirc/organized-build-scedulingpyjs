import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createCustomerSchema, customerIdSchema, listCustomersSchema, updateCustomerSchema } from "./customers.schemas.js";
import { customersController } from "./customers.controller.js";

export const customersRouter = Router();

customersRouter.get("/", requireRole(Role.SCHEDULER), validate(listCustomersSchema), asyncHandler(customersController.list));
customersRouter.post("/", requireRole(Role.SCHEDULER), validate(createCustomerSchema), asyncHandler(customersController.create));
customersRouter.get("/:id", requireRole(Role.SCHEDULER), validate(customerIdSchema), asyncHandler(customersController.getById));
customersRouter.patch("/:id", requireRole(Role.SCHEDULER), validate(updateCustomerSchema), asyncHandler(customersController.update));
customersRouter.delete("/:id", requireRole(Role.MANAGER), validate(customerIdSchema), asyncHandler(customersController.remove));
customersRouter.get("/:id/appointments", requireRole(Role.SCHEDULER), validate(customerIdSchema), asyncHandler(customersController.appointments));

