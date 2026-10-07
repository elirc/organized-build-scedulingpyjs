# Architecture

This page describes the rules the code follows **as written**, with the places where the code and the intended design part ways. Line numbers refer to the current tree.

## Core Rules

| Rule | Where it holds | Where it does not (yet) |
| --- | --- | --- |
| Store appointment timestamps in UTC | `Appointment.startTimeUtc` / `endTimeUtc` in `backend/prisma/schema.prisma`; `convertLocalToUtc` in `backend/src/shared/utils/timezones.ts:10-17` | — |
| Keep the caller's timezone | `Appointment.timezone` is written on book (`appointments.service.ts:106`) and reschedule (`:245`) | — |
| Business logic in services, not controllers | controllers are one-liners, e.g. `appointments.controller.ts` | `availability.routes.ts:35-45` calls `generateAvailableSlots` straight from the router |
| Slot generation is separate from booking | `slotGeneration.service.ts` vs `appointments.service.ts:37` | — |
| Booking rechecks inside a transaction | the overlap query runs inside `prisma.$transaction` (`appointments.service.ts:46-94`) | only **appointment overlap** is rechecked. Booking never consults availability windows or blocked time, so a direct API call can book outside working hours. Reschedule's overlap check runs **before** its transaction (`:227-236`). |

## Backend Shape

`backend/src/app.ts:20-48` builds the Express app: `cors` → `helmet` → `express.json` → `morgan` → `requestLogger` → `authMiddleware` → ten routers under `/api/*` → `errorMiddleware`.

- **routes** (`modules/*/*.routes.ts`) pick the minimum role (`requireRole`) and the Zod schema (`validate`).
- **controllers** pull ids and the actor off `req` and call one service method.
- **services** own business rules and transactions.
- **repositories** exist only where reads grew includes (`appointments`, `availability`, `customers`, `services`, `staff`); other services call `prisma` directly.
- **middleware**: `authMiddleware` decodes a Bearer token but never rejects — a missing or bad token simply leaves `req.user` undefined (`auth.middleware.ts:12-31`). Rejection happens later in `requireRole` (`requirePermission.middleware.ts:15-28`), which compares numeric role levels.
- **errors**: services throw `AppError(code, status)`. `errorMiddleware` serializes `AppError` and turns **everything else into 500** (`error.middleware.ts:5-21`) — including the `ZodError` that `validate` forwards (`validate.middleware.ts:13`). See CODE_REVIEW_GUIDE.md finding 3.

There are two copies of the role ladder: `shared/utils/permissions.ts:3-10` and `middleware/requirePermission.middleware.ts:6-13`. They agree today; nothing forces them to keep agreeing.

## Frontend Shape

- `src/api/*.api.ts` wrap axios calls on one shared `apiClient` (`src/api/client.ts`). Its `baseURL` is hard-coded to `http://localhost:4000/api`; nothing in `src/` reads a `VITE_API_BASE_URL` (this export ships no `.env.example` files).
- `src/auth/auth.store.ts` keeps the token in Zustand memory and pushes it into `apiClient.defaults.headers` — a page reload logs you out, and the refresh token returned by `/api/auth/login` is never stored or used.
- TanStack Query owns server state (`features/*/hooks/*`); query keys include all parameters, e.g. `["slots", params]` in `useAvailableSlots.ts`.
- `RequireAuth` wraps the authenticated routes in `src/app/router.tsx:30`. `src/auth/RequireRole.tsx` exists but no route uses it, so every signed-in role sees every page; the API's `requireRole` is the only role gate.

## Scheduling Design

- **Availability windows** come in two shapes (`AvailabilityWindow` in the schema): weekly-recurring (`dayOfWeek` + `startTimeLocal`/`endTimeLocal` + `timezone`) and dated (`startDateUtc`/`endDateUtc`). `type` is `AVAILABLE` or `BLOCKED`.
- **Slot generation** (`slotGeneration.service.ts:21-152`) walks each available window in 15-minute steps, reserving `bufferBefore + duration + bufferAfter` inside the window, and drops slots that overlap an existing `REQUESTED`/`CONFIRMED` appointment or a blocked window. The overlap test uses the **un-buffered** slot (`:121-131`), so buffers keep a slot away from the window edges but not away from a neighbouring appointment.
- **Booking** (`appointments.service.ts:37-160`) is authoritative only about overlap with other appointments, using the same half-open rule as `overlaps()` (`conflictDetection.service.ts:14`): back-to-back is allowed.
- **Recurring series** (`recurrence.service.ts:49-142`) store a `RecurrenceSeries` row plus up to 52 concrete `Appointment` rows (`:91`). One conflicting occurrence rolls back the whole series (`:110-112`).

## Appointment Lifecycle

The table in `appointment.stateMachine.ts:4-11`:

- `REQUESTED -> CONFIRMED | CANCELLED`
- `CONFIRMED -> CANCELLED | COMPLETED | NO_SHOW | RESCHEDULED`
- `RESCHEDULED -> CONFIRMED`
- `CANCELLED`, `COMPLETED`, `NO_SHOW` are terminal.

What the services actually persist is narrower:

- New bookings and recurring occurrences are created directly as `CONFIRMED` (`appointments.service.ts:103`, `recurrence.service.ts:121`); nothing in the backend writes `REQUESTED`.
- `reschedule` checks `CONFIRMED -> RESCHEDULED` (`appointments.service.ts:221`) but writes `CONFIRMED` (`:242`). No code path stores `RESCHEDULED`; the history lives in `AppointmentActivity` (`oldValue`/`newValue`).
- No transition guards against a concurrent status change. `cancel`, `reschedule`, `complete` (`appointments.service.ts:308-314`), and `markNoShow` (`:339-344`) all read the status, check it, and then update `where: { id }` alone, so a change committed between the read and the write is overwritten. (The canonical `buildscedulingpyjs` repo later added a compare-and-set to `complete`; this snapshot predates it.)

## Async Notification Flow

1. Booking writes three `Notification` rows inside its transaction: confirmation now, reminders at T-24h and T-1h (`appointments.service.ts:135-156`).
2. `notificationsService.enqueuePendingNotifications` (`notifications.service.ts:21-35`) adds a BullMQ job for **every** `PENDING` row. It does not filter on `scheduledForUtc`, and it does not pass a `jobId`, so calling it twice enqueues duplicates.
3. `reminderWorker` (`jobs/reminder.processor.ts`) calls `processNotification`, which skips `CANCELLED` rows, sends via `emailService`, and marks the row `SENT` or `FAILED` (`notifications.service.ts:49-103`).
4. Cancel and reschedule flip all `PENDING` rows for the appointment to `CANCELLED` after their transaction (`notifications.service.ts:37-47`).

What is **not wired**: `server.ts` only starts the HTTP listener. No file imports `jobs/reminder.processor.ts` or `jobs/notification.processor.ts`, so no worker or sweep runs unless you start one yourself; the only trigger is a manager calling `POST /api/notifications/enqueue`. `jobs/recurrence.processor.ts` is a placeholder that logs and returns.
