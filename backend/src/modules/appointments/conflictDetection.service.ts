import { DateTime } from "luxon";

export function overlaps(
  startA: Date | DateTime,
  endA: Date | DateTime,
  startB: Date | DateTime,
  endB: Date | DateTime
) {
  const aStart = startA instanceof DateTime ? startA.toMillis() : startA.getTime();
  const aEnd = endA instanceof DateTime ? endA.toMillis() : endA.getTime();
  const bStart = startB instanceof DateTime ? startB.toMillis() : startB.getTime();
  const bEnd = endB instanceof DateTime ? endB.toMillis() : endB.getTime();

  return aStart < bEnd && aEnd > bStart;
}
