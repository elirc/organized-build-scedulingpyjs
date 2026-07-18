import { DateTime } from "luxon";

export function buildWeekDays(startDate: string, timezone: string) {
  const start = DateTime.fromISO(startDate, { zone: timezone }).startOf("week");
  return Array.from({ length: 7 }, (_, index) => start.plus({ days: index }));
}

