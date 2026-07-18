import { DateTime } from "luxon";
import { AppError } from "../errors/AppError.js";

export function assertValidTimezone(timezone: string) {
  if (!DateTime.now().setZone(timezone).isValid) {
    throw new AppError("INVALID_TIMEZONE", 400, `Invalid timezone: ${timezone}`);
  }
}

export function convertLocalToUtc(isoLocal: string, timezone: string) {
  assertValidTimezone(timezone);
  const local = DateTime.fromISO(isoLocal, { zone: timezone });
  if (!local.isValid) {
    throw new AppError("INVALID_LOCAL_DATETIME", 400, "Invalid local date/time");
  }
  return local.toUTC();
}

export function convertUtcToTimezone(date: Date | string, timezone: string) {
  assertValidTimezone(timezone);
  return DateTime.fromJSDate(typeof date === "string" ? new Date(date) : date, { zone: "utc" }).setZone(timezone);
}

export function startOfLocalDay(date: string, timezone: string) {
  return DateTime.fromISO(date, { zone: timezone }).startOf("day");
}

export function endOfLocalDay(date: string, timezone: string) {
  return DateTime.fromISO(date, { zone: timezone }).endOf("day");
}

export function formatLocal(date: Date | string, timezone: string) {
  return convertUtcToTimezone(date, timezone).toFormat("yyyy-LL-dd HH:mm");
}
