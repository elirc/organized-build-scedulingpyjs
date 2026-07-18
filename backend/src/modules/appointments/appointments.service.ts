import { AppointmentSource, AppointmentStatus, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { assertValidTimezone, convertLocalToUtc } from "../../shared/utils/timezones.js";
import { nowUtc } from "../../shared/utils/dates.js";
import { createAuditEvent } from "../audit/audit.service.js";
import { notificationsService } from "../notifications/notifications.service.js";
import { assertValidAppointmentTransition } from "./appointment.stateMachine.js";
import { recurrenceService } from "./recurrence.service.js";
import { appointmentsRepository } from "./appointments.repository.js";

async function getCustomerEmail(tx: Prisma.TransactionClient, customerId: string) {
  const customer = await tx.customerProfile.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw new AppError("CUSTOMER_NOT_FOUND", 404);
  }
  return customer.email;
}

export const appointmentsService = {
  async list() {
    return appointmentsRepository.list();
  },

  async listForCustomer(customerId: string) {
    return appointmentsRepository.listForCustomer(customerId);
  },

  async getById(id: string) {
    const appointment = await appointmentsRepository.getById(id);
    if (!appointment) {
      throw new AppError("APPOINTMENT_NOT_FOUND", 404);
    }
    return appointment;
  },

  async book(input: {
    customerId: string;
    staffId: string;
    serviceId: string;
    startTimeLocal: string;
    timezone: string;
    createdById?: string;
    source: AppointmentSource;
  }) {
    return prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id: input.serviceId } });
      if (!service || !service.isActive) {
        throw new AppError("SERVICE_NOT_FOUND", 404);
      }

      const staff = await tx.staffProfile.findUnique({ where: { id: input.staffId } });
      if (!staff || !staff.isActive) {
        throw new AppError("STAFF_NOT_FOUND", 404);
      }

      const staffService = await tx.staffService.findUnique({
        where: {
          staffId_serviceId: {
            staffId: input.staffId,
            serviceId: input.serviceId
          }
        }
      });

      if (!staffService) {
        throw new AppError("STAFF_DOES_NOT_OFFER_SERVICE", 400);
      }

      const startTimeUtc = convertLocalToUtc(input.startTimeLocal, input.timezone);
      const endTimeUtc = startTimeUtc.plus({ minutes: service.durationMinutes });

      if (startTimeUtc < nowUtc()) {
        throw new AppError("CANNOT_BOOK_IN_PAST", 400);
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          staffId: input.staffId,
          status: {
            in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]
          },
          startTimeUtc: {
            lt: endTimeUtc.toJSDate()
          },
          endTimeUtc: {
            gt: startTimeUtc.toJSDate()
          }
        }
      });

      if (conflict) {
        throw new AppError("APPOINTMENT_CONFLICT", 409);
      }

      const appointment = await tx.appointment.create({
        data: {
          customerId: input.customerId,
          staffId: input.staffId,
          serviceId: input.serviceId,
          createdById: input.createdById,
          source: input.source,
          status: AppointmentStatus.CONFIRMED,
          startTimeUtc: startTimeUtc.toJSDate(),
          endTimeUtc: endTimeUtc.toJSDate(),
          timezone: input.timezone
        }
      });

      await tx.appointmentActivity.create({
        data: {
          appointmentId: appointment.id,
          actorId: input.createdById,
          action: "APPOINTMENT_BOOKED",
          metadata: {
            customerId: input.customerId,
            staffId: input.staffId,
            serviceId: input.serviceId,
            timezone: input.timezone
          }
        }
      });

      await tx.auditEvent.create({
        data: {
          actorId: input.createdById,
          entityType: "Appointment",
          entityId: appointment.id,
          action: "APPOINTMENT_BOOKED"
        }
      });

      const recipientEmail = await getCustomerEmail(tx, input.customerId);

      await tx.notification.createMany({
        data: [
          {
            appointmentId: appointment.id,
            recipientEmail,
            type: NotificationType.APPOINTMENT_CONFIRMATION,
            scheduledForUtc: nowUtc().toJSDate()
          },
          {
            appointmentId: appointment.id,
            recipientEmail,
            type: NotificationType.APPOINTMENT_REMINDER,
            scheduledForUtc: startTimeUtc.minus({ hours: 24 }).toJSDate()
          },
          {
            appointmentId: appointment.id,
            recipientEmail,
            type: NotificationType.APPOINTMENT_REMINDER,
            scheduledForUtc: startTimeUtc.minus({ hours: 1 }).toJSDate()
          }
        ]
      });

      return appointment;
    });
  },

  async cancel(input: {
    id: string;
    actorId?: string;
    reason: string;
  }) {
    const appointment = await this.getById(input.id);
    assertValidAppointmentTransition(appointment.status, AppointmentStatus.CANCELLED);

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.appointment.update({
        where: { id: input.id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancellationReason: input.reason,
          cancelledAt: new Date()
        }
      });

      await tx.appointmentActivity.create({
        data: {
          appointmentId: input.id,
          actorId: input.actorId,
          action: "APPOINTMENT_CANCELLED",
          newValue: input.reason
        }
      });

      await createAuditEvent(tx, {
        actorId: input.actorId,
        entityType: "Appointment",
        entityId: input.id,
        action: "APPOINTMENT_CANCELLED",
        metadata: { reason: input.reason }
      });

      await tx.notification.create({
        data: {
          appointmentId: input.id,
          recipientEmail: appointment.customer.email,
          type: NotificationType.APPOINTMENT_CANCELLED,
          scheduledForUtc: new Date()
        }
      });

      return item;
    });

    await notificationsService.cancelFutureNotificationsForAppointment(input.id);

    return updated;
  },

  async reschedule(input: {
    id: string;
    actorId?: string;
    startTimeLocal: string;
    timezone: string;
  }) {
    const appointment = await this.getById(input.id);
    assertValidAppointmentTransition(appointment.status, AppointmentStatus.RESCHEDULED);
    assertValidTimezone(input.timezone);

    const startUtc = convertLocalToUtc(input.startTimeLocal, input.timezone);
    const endUtc = startUtc.plus({ minutes: appointment.service.durationMinutes });

    const conflict = await appointmentsRepository.findConflict(
      appointment.staffId,
      startUtc.toJSDate(),
      endUtc.toJSDate(),
      appointment.id
    );

    if (conflict) {
      throw new AppError("APPOINTMENT_CONFLICT", 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.appointment.update({
        where: { id: input.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          startTimeUtc: startUtc.toJSDate(),
          endTimeUtc: endUtc.toJSDate(),
          timezone: input.timezone
        }
      });

      await tx.appointmentActivity.create({
        data: {
          appointmentId: input.id,
          actorId: input.actorId,
          action: "APPOINTMENT_RESCHEDULED",
          oldValue: appointment.startTimeUtc.toISOString(),
          newValue: startUtc.toISO() ?? ""
        }
      });

      await createAuditEvent(tx, {
        actorId: input.actorId,
        entityType: "Appointment",
        entityId: input.id,
        action: "APPOINTMENT_RESCHEDULED",
        metadata: {
          from: appointment.startTimeUtc.toISOString(),
          to: startUtc.toISO()
        }
      });

      await tx.notification.create({
        data: {
          appointmentId: input.id,
          recipientEmail: appointment.customer.email,
          type: NotificationType.APPOINTMENT_RESCHEDULED,
          scheduledForUtc: new Date()
        }
      });

      return item;
    });

    await notificationsService.cancelFutureNotificationsForAppointment(input.id);

    await prisma.notification.createMany({
      data: [
        {
          appointmentId: appointment.id,
          recipientEmail: appointment.customer.email,
          type: NotificationType.APPOINTMENT_REMINDER,
          scheduledForUtc: startUtc.minus({ hours: 24 }).toJSDate()
        },
        {
          appointmentId: appointment.id,
          recipientEmail: appointment.customer.email,
          type: NotificationType.APPOINTMENT_REMINDER,
          scheduledForUtc: startUtc.minus({ hours: 1 }).toJSDate()
        }
      ]
    });

    return updated;
  },

  async complete(id: string, actorId?: string) {
    const appointment = await this.getById(id);
    assertValidAppointmentTransition(appointment.status, AppointmentStatus.COMPLETED);
    return prisma.$transaction(async (tx) => {
      const item = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.COMPLETED,
          completedAt: new Date()
        }
      });

      await tx.appointmentActivity.create({
        data: {
          appointmentId: id,
          actorId,
          action: "APPOINTMENT_COMPLETED"
        }
      });

      await createAuditEvent(tx, {
        actorId,
        entityType: "Appointment",
        entityId: id,
        action: "APPOINTMENT_COMPLETED"
      });

      return item;
    });
  },

  async markNoShow(id: string, actorId?: string) {
    const appointment = await this.getById(id);
    assertValidAppointmentTransition(appointment.status, AppointmentStatus.NO_SHOW);
    return prisma.$transaction(async (tx) => {
      const item = await tx.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.NO_SHOW
        }
      });

      await tx.appointmentActivity.create({
        data: {
          appointmentId: id,
          actorId,
          action: "APPOINTMENT_NO_SHOW"
        }
      });

      await createAuditEvent(tx, {
        actorId,
        entityType: "Appointment",
        entityId: id,
        action: "APPOINTMENT_NO_SHOW"
      });

      return item;
    });
  },

  async getActivity(id: string) {
    const appointment = await this.getById(id);
    return appointment.activities;
  },

  async createRecurring(input: {
    customerId: string;
    staffId: string;
    serviceId: string;
    firstStartTimeLocal: string;
    timezone: string;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    interval: number;
    count?: number;
    untilDateUtc?: string;
    actorId?: string;
  }) {
    return recurrenceService.createSeries(input.actorId, {
      ...input,
      frequency: input.frequency,
      source: "SYSTEM_GENERATED"
    });
  },

  async getRecurrenceSeries(id: string) {
    return recurrenceService.getSeries(id);
  },

  async cancelRecurrenceSeries(actorId: string | undefined, id: string) {
    return recurrenceService.cancelSeries(actorId, id);
  }
};
