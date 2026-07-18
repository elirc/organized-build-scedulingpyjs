import { RecurrenceFrequency, type AppointmentSource, type Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { assertValidTimezone, convertLocalToUtc } from "../../shared/utils/timezones.js";
import { createAuditEvent } from "../audit/audit.service.js";
import { appointmentsRepository } from "./appointments.repository.js";

type GenerateOccurrencesInput = {
  firstStartTimeLocal: string;
  timezone: string;
  frequency: RecurrenceFrequency;
  interval: number;
  count?: number;
  untilDateUtc?: string;
  maxOccurrences: number;
};

export function generateOccurrences(input: GenerateOccurrencesInput) {
  assertValidTimezone(input.timezone);

  const occurrences: Array<{ startTimeLocal: string }> = [];
  let cursor = DateTime.fromISO(input.firstStartTimeLocal, { zone: input.timezone });
  const until = input.untilDateUtc ? DateTime.fromISO(input.untilDateUtc, { zone: "utc" }) : null;
  const limit = Math.min(input.count ?? input.maxOccurrences, input.maxOccurrences);

  while (occurrences.length < limit) {
    if (until && cursor.toUTC() > until) {
      break;
    }

    occurrences.push({
      startTimeLocal: cursor.toISO({ suppressMilliseconds: true }) ?? cursor.toISO() ?? ""
    });

    if (input.frequency === RecurrenceFrequency.DAILY) {
      cursor = cursor.plus({ days: input.interval });
    } else if (input.frequency === RecurrenceFrequency.WEEKLY) {
      cursor = cursor.plus({ weeks: input.interval });
    } else {
      cursor = cursor.plus({ months: input.interval });
    }
  }

  return occurrences;
}

export const recurrenceService = {
  async createSeries(actorId: string | undefined, input: {
    customerId: string;
    staffId: string;
    serviceId: string;
    firstStartTimeLocal: string;
    timezone: string;
    frequency: RecurrenceFrequency;
    interval: number;
    count?: number;
    untilDateUtc?: string;
    source?: AppointmentSource;
  }) {
    assertValidTimezone(input.timezone);

    return prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id: input.serviceId } });
      if (!service) {
        throw new AppError("SERVICE_NOT_FOUND", 404);
      }

      const series = await tx.recurrenceSeries.create({
        data: {
          customerId: input.customerId,
          staffId: input.staffId,
          serviceId: input.serviceId,
          frequency: input.frequency,
          interval: input.interval,
          count: input.count,
          untilDateUtc: input.untilDateUtc ? new Date(input.untilDateUtc) : undefined,
          timezone: input.timezone,
          startTimeLocal: DateTime.fromISO(input.firstStartTimeLocal, { zone: input.timezone }).toFormat("HH:mm"),
          durationMinutes: service.durationMinutes
        }
      });

      const occurrences = generateOccurrences({
        firstStartTimeLocal: input.firstStartTimeLocal,
        timezone: input.timezone,
        frequency: input.frequency,
        interval: input.interval,
        count: input.count,
        untilDateUtc: input.untilDateUtc,
        maxOccurrences: 52
      });

      const appointments = [];

      for (const occurrence of occurrences) {
        const startUtc = convertLocalToUtc(occurrence.startTimeLocal, input.timezone);
        const endUtc = startUtc.plus({ minutes: service.durationMinutes });
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId: input.staffId,
            status: {
              in: ["REQUESTED", "CONFIRMED"]
            },
            startTimeUtc: { lt: endUtc.toJSDate() },
            endTimeUtc: { gt: startUtc.toJSDate() }
          }
        });

        if (conflict) {
          throw new AppError("RECURRENCE_CONFLICT", 409, "One or more recurring occurrences conflict with existing appointments");
        }

        const appointment = await tx.appointment.create({
          data: {
            customerId: input.customerId,
            staffId: input.staffId,
            serviceId: input.serviceId,
            createdById: actorId,
            source: input.source ?? "SYSTEM_GENERATED",
            status: "CONFIRMED",
            startTimeUtc: startUtc.toJSDate(),
            endTimeUtc: endUtc.toJSDate(),
            timezone: input.timezone,
            recurrenceSeriesId: series.id
          }
        });

        appointments.push(appointment);
      }

      await createAuditEvent(tx as Prisma.TransactionClient, {
        actorId,
        entityType: "RecurrenceSeries",
        entityId: series.id,
        action: "RECURRENCE_SERIES_CREATED",
        metadata: { appointmentCount: appointments.length }
      });

      return { series, appointments };
    });
  },

  async getSeries(id: string) {
    const series = await prisma.recurrenceSeries.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { startTimeUtc: "asc" }
        }
      }
    });

    if (!series) {
      throw new AppError("RECURRENCE_SERIES_NOT_FOUND", 404);
    }

    return series;
  },

  async cancelSeries(actorId: string | undefined, id: string) {
    const series = await this.getSeries(id);

    const result = await prisma.$transaction(async (tx) => {
      const updatedSeries = await tx.recurrenceSeries.update({
        where: { id },
        data: {
          cancelledAt: new Date()
        }
      });

      await tx.appointment.updateMany({
        where: {
          recurrenceSeriesId: id,
          status: {
            in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"]
          }
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date()
        }
      });

      await createAuditEvent(tx, {
        actorId,
        entityType: "RecurrenceSeries",
        entityId: id,
        action: "RECURRENCE_SERIES_CANCELLED",
        metadata: { appointmentCount: series.appointments.length }
      });

      return updatedSeries;
    });

    return result;
  }
};

