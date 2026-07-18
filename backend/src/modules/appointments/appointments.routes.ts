import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { appointmentsController } from "./appointments.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  appointmentIdSchema,
  bookAppointmentSchema,
  cancelAppointmentSchema,
  createRecurringAppointmentsSchema,
  recurrenceSeriesIdSchema,
  rescheduleAppointmentSchema
} from "./appointments.schemas.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", requireRole(Role.STAFF), asyncHandler(appointmentsController.list));
appointmentsRouter.post("/", requireRole(Role.CUSTOMER), validate(bookAppointmentSchema), asyncHandler(appointmentsController.book));
appointmentsRouter.get("/:id", requireRole(Role.STAFF), validate(appointmentIdSchema), asyncHandler(appointmentsController.getById));
appointmentsRouter.post("/:id/cancel", requireRole(Role.CUSTOMER), validate(cancelAppointmentSchema), asyncHandler(appointmentsController.cancel));
appointmentsRouter.post("/:id/reschedule", requireRole(Role.CUSTOMER), validate(rescheduleAppointmentSchema), asyncHandler(appointmentsController.reschedule));
appointmentsRouter.post("/:id/complete", requireRole(Role.STAFF), validate(appointmentIdSchema), asyncHandler(appointmentsController.complete));
appointmentsRouter.post("/:id/no-show", requireRole(Role.STAFF), validate(appointmentIdSchema), asyncHandler(appointmentsController.noShow));
appointmentsRouter.get("/:id/activity", requireRole(Role.STAFF), validate(appointmentIdSchema), asyncHandler(appointmentsController.activity));
appointmentsRouter.post("/recurring", requireRole(Role.SCHEDULER), validate(createRecurringAppointmentsSchema), asyncHandler(appointmentsController.createRecurring));
appointmentsRouter.get("/recurrence-series/:id", requireRole(Role.STAFF), validate(recurrenceSeriesIdSchema), asyncHandler(appointmentsController.getRecurrenceSeries));
appointmentsRouter.post("/recurrence-series/:id/cancel", requireRole(Role.SCHEDULER), validate(recurrenceSeriesIdSchema), asyncHandler(appointmentsController.cancelRecurrenceSeries));
