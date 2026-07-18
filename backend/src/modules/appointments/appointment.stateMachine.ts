import { AppointmentStatus } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError.js";

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  REQUESTED: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  CONFIRMED: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW, AppointmentStatus.RESCHEDULED],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
  RESCHEDULED: [AppointmentStatus.CONFIRMED]
};

export function assertValidAppointmentTransition(from: AppointmentStatus, to: AppointmentStatus) {
  if (!transitions[from].includes(to)) {
    throw new AppError(
      "INVALID_APPOINTMENT_STATUS_TRANSITION",
      400,
      `Cannot move appointment from ${from} to ${to}`
    );
  }
}

export function getAllowedAppointmentTransitions(status: AppointmentStatus) {
  return transitions[status];
}

