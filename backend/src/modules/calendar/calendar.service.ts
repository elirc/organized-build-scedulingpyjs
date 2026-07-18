import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { DateTime } from "luxon";
import { assertValidTimezone } from "../../shared/utils/timezones.js";

function buildRange(startDate: string, timezone: string, mode: "day" | "week" | "month") {
  const start = DateTime.fromISO(startDate, { zone: timezone }).startOf("day");
  const end =
    mode === "day" ? start.endOf("day") :
    mode === "week" ? start.plus({ days: 6 }).endOf("day") :
    start.endOf("month");
  return { start, end };
}

async function getCalendarRange(input: {
  staffId?: string;
  startDate: string;
  timezone: string;
  mode: "day" | "week" | "month";
}) {
  assertValidTimezone(input.timezone);
  const { start, end } = buildRange(input.startDate, input.timezone, input.mode);

  const appointments = await prisma.appointment.findMany({
    where: {
      staffId: input.staffId,
      startTimeUtc: { lt: end.toUTC().toJSDate() },
      endTimeUtc: { gt: start.toUTC().toJSDate() }
    },
    include: {
      customer: true,
      staff: true,
      service: true
    },
    orderBy: {
      startTimeUtc: "asc"
    }
  });

  return {
    mode: input.mode,
    timezone: input.timezone,
    range: {
      start: start.toISO(),
      end: end.toISO()
    },
    appointments
  };
}

export const calendarService = {
  async getDayView(input: { staffId?: string; startDate: string; timezone: string }) {
    return getCalendarRange({ ...input, mode: "day" });
  },
  async getWeekView(input: { staffId?: string; startDate: string; timezone: string }) {
    return getCalendarRange({ ...input, mode: "week" });
  },
  async getMonthView(input: { staffId?: string; startDate: string; timezone: string }) {
    return getCalendarRange({ ...input, mode: "month" });
  }
};

