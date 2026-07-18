import { AvailabilityType, PrismaClient, AppointmentStatus } from "@prisma/client";
import { DateTime } from "luxon";
import { AppError } from "../../shared/errors/AppError.js";
import { assertValidTimezone, endOfLocalDay, formatLocal, startOfLocalDay } from "../../shared/utils/timezones.js";
import { nowUtc } from "../../shared/utils/dates.js";
import { overlaps } from "../appointments/conflictDetection.service.js";

type SlotParams = {
  prisma: PrismaClient;
  serviceId: string;
  staffId: string;
  date: string;
  timezone: string;
  slotIntervalMinutes?: number;
};

function combineLocalDateAndTime(date: string, time: string, timezone: string) {
  return DateTime.fromISO(`${date}T${time}`, { zone: timezone });
}

export async function generateAvailableSlots({
  prisma,
  serviceId,
  staffId,
  date,
  timezone,
  slotIntervalMinutes = 15
}: SlotParams) {
  assertValidTimezone(timezone);

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    throw new AppError("SERVICE_NOT_FOUND", 404);
  }

  const staffService = await prisma.staffService.findUnique({
    where: {
      staffId_serviceId: {
        staffId,
        serviceId
      }
    }
  });

  if (!staffService) {
    throw new AppError("STAFF_DOES_NOT_OFFER_SERVICE", 400);
  }

  const localDayStart = startOfLocalDay(date, timezone);
  const localDayEnd = endOfLocalDay(date, timezone);

  const windows = await prisma.availabilityWindow.findMany({
    where: {
      staffId,
      OR: [
        {
          isRecurringWeekly: true,
          dayOfWeek: localDayStart.weekday % 7,
          startTimeLocal: { not: null },
          endTimeLocal: { not: null }
        },
        {
          startDateUtc: { lte: localDayEnd.toUTC().toJSDate() },
          endDateUtc: { gte: localDayStart.toUTC().toJSDate() }
        }
      ]
    }
  });

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      staffId,
      status: {
        in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]
      },
      startTimeUtc: {
        lt: localDayEnd.toUTC().toJSDate()
      },
      endTimeUtc: {
        gt: localDayStart.toUTC().toJSDate()
      }
    }
  });

  const availableWindows = windows
    .filter((window) => window.type === AvailabilityType.AVAILABLE)
    .map((window) => {
      if (window.isRecurringWeekly && window.startTimeLocal && window.endTimeLocal) {
        return {
          startUtc: combineLocalDateAndTime(date, window.startTimeLocal, window.timezone).toUTC(),
          endUtc: combineLocalDateAndTime(date, window.endTimeLocal, window.timezone).toUTC()
        };
      }

      return {
        startUtc: DateTime.fromJSDate(window.startDateUtc!, { zone: "utc" }),
        endUtc: DateTime.fromJSDate(window.endDateUtc!, { zone: "utc" })
      };
    });

  const blockedWindows = windows
    .filter((window) => window.type === AvailabilityType.BLOCKED)
    .map((window) => ({
      startUtc: DateTime.fromJSDate(window.startDateUtc!, { zone: "utc" }),
      endUtc: DateTime.fromJSDate(window.endDateUtc!, { zone: "utc" })
    }));

  const slotDuration = service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes;
  const slots: Array<{
    startTimeUtc: string;
    endTimeUtc: string;
    startTimeLocal: string;
    endTimeLocal: string;
    timezone: string;
  }> = [];

  for (const window of availableWindows) {
    let cursor = window.startUtc;

    while (cursor.plus({ minutes: slotDuration }) <= window.endUtc) {
      const slotStart = cursor.plus({ minutes: service.bufferBeforeMinutes });
      const slotEnd = slotStart.plus({ minutes: service.durationMinutes });

      const conflictsWithAppointment = existingAppointments.some((appointment) =>
        overlaps(
          slotStart,
          slotEnd,
          appointment.startTimeUtc,
          appointment.endTimeUtc
        )
      );

      const conflictsWithBlockedWindow = blockedWindows.some((block) =>
        overlaps(slotStart, slotEnd, block.startUtc, block.endUtc)
      );

      if (!conflictsWithAppointment && !conflictsWithBlockedWindow && slotStart >= nowUtc()) {
        slots.push({
          startTimeUtc: slotStart.toUTC().toISO() ?? "",
          endTimeUtc: slotEnd.toUTC().toISO() ?? "",
          startTimeLocal: formatLocal(slotStart.toJSDate(), timezone),
          endTimeLocal: formatLocal(slotEnd.toJSDate(), timezone),
          timezone
        });
      }

      cursor = cursor.plus({ minutes: slotIntervalMinutes });
    }
  }

  return slots;
}
