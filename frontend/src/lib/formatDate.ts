import { DateTime } from "luxon";

export function formatUtcInTimezone(isoUtc: string, timezone: string, format = "DDD t") {
  return DateTime.fromISO(isoUtc, { zone: "utc" }).setZone(timezone).toFormat(format);
}

