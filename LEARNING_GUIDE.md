# Learning Guide

Scheduling systems look simple until timezones, daylight saving time, overlap detection, and concurrent requests enter the picture. This guide is the study route; the detailed traces live in [FEATURE_WALKTHROUGHS.md](FEATURE_WALKTHROUGHS.md). (The canonical `buildscedulingpyjs` repo also has a hands-on `astraupskill/` course; this snapshot does not.)

## Route

Read each file, then answer the question in the right-hand column before moving on. Answers are in the linked docs.

| # | File | Question to answer |
| --- | --- | --- |
| 1 | `backend/prisma/schema.prisma` | Which columns are UTC instants, and which are local wall-clock strings (`AvailabilityWindow.startTimeLocal`, `RecurrenceSeries.startTimeLocal`)? Why does each table also carry `timezone`? |
| 2 | `backend/src/middleware/auth.middleware.ts`, `requirePermission.middleware.ts`, any `*.routes.ts` | Where is a request with no token rejected? (Not in `authMiddleware`.) |
| 3 | `backend/src/shared/utils/timezones.ts` | What does `convertLocalToUtc("2026-03-08T02:30:00", "America/Chicago")` have to decide? (That wall time does not exist.) |
| 4 | `backend/src/modules/appointments/conflictDetection.service.ts` | Why is `aStart < bEnd && aEnd > bStart` the whole overlap rule, and why does it let 10:00–11:00 and 11:00–12:00 coexist? |
| 5 | `backend/src/modules/availability/slotGeneration.service.ts` | Which timezone is used to place a weekly window on a date — the requester's or the window's? (Line 90.) |
| 6 | `backend/src/modules/appointments/appointments.service.ts` `book` | What does booking re-verify inside its transaction, and what does it skip? |
| 7 | same file, `cancel` / `reschedule` / `complete` / `markNoShow` | Which of the four protects itself against a concurrent status change? |
| 8 | `backend/src/modules/appointments/recurrence.service.ts` | What happens to the whole series if occurrence 7 of 10 conflicts? |
| 9 | `backend/src/modules/notifications/notifications.service.ts`, `backend/src/jobs/*` | Who actually starts the worker? (Search for an import of `reminder.processor`.) |
| 10 | `frontend/src/features/booking/BookAppointmentPage.tsx` → `hooks/` → `api/appointments.api.ts` | Trace a click on **Confirm Booking** to the HTTP request body. |

## Things to notice while studying

- **Slot generation is advisory; booking is authoritative — about overlaps only.** The slot list already excludes blocked time and out-of-hours times, but `book` re-checks only appointment overlap. A client that skips the slot list can book at 03:00.
- **UTC storage solves comparison, not intent.** "Every Tuesday at 09:00 Chicago time" has to be expanded in the local zone (`generateOccurrences` uses `cursor.plus({ weeks })` on a zoned Luxon `DateTime`, `recurrence.service.ts:23-42`) and only then converted to UTC, or the series drifts an hour across DST.
- **Back-to-back is allowed, and buffers do not change that.** Buffers shape where slots start inside a window (`slotGeneration.service.ts:108-122`), but both the slot filter and `book` test overlap on the un-buffered times.
- **Notifications are rows first, jobs second.** Every lifecycle change writes `Notification` rows inside the business transaction; sending is a separate, currently unwired, worker concern.
- **The calendar is mostly a date-range query.** `calendar.service.ts:6-13` builds day/week/month ranges in the viewer's zone, then queries overlapping UTC intervals. Its complexity is in the frontend, where timezone, filters, and range all feed the query key.

## After the route

1. Run the existing Vitest suite, or load a service with stubs if you cannot install: see [TESTING_GUIDE.md](TESTING_GUIDE.md).
2. Pick one defect from [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md) — finding 10 (no status transition is race-safe) is a good first one — and write the failing test before the fix.
3. Read [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md) last and try to find each listed defect yourself before reading its explanation.
