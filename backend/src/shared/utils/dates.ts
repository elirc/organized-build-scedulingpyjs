import { DateTime } from "luxon";

export function nowUtc() {
  return DateTime.utc();
}

export function addMinutes(date: DateTime, minutes: number) {
  return date.plus({ minutes });
}
