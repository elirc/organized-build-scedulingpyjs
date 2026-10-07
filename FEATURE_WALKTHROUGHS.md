# Feature Walkthroughs

Each walkthrough follows one request from the route to the database. Unless noted, line numbers are in `backend/src/modules/appointments/appointments.service.ts`.

## Show Available Slots

`GET /api/availability/slots?serviceId&staffId&date&timezone` — no `requireRole`, so it is public (`availability.routes.ts:35`).

1. `slotsSchema` requires `date` to match `YYYY-MM-DD` (`availability.routes.ts:17-26`).
2. `generateAvailableSlots` (`slotGeneration.service.ts:21`) validates the timezone, loads the service, and checks the `StaffService` pair (`:29-47`).
3. It computes the requester's local day `[startOfDay, endOfDay]` (`:49-50`) and loads windows that are either weekly on that weekday (`localDayStart.weekday % 7` turns Luxon's Mon=1..Sun=7 into Sun=0, `:58`) or dated and overlapping the day (`:62-65`).
4. It loads the staff member's `REQUESTED`/`CONFIRMED` appointments overlapping the day (`:70-83`).
5. Weekly windows are placed on `date` **in the window's own timezone** (`:88-92`); dated windows are already UTC.
6. For each available window, a cursor advances in 15-minute steps while `bufferBefore + duration + bufferAfter` still fits (`:117-120`). The candidate slot starts after `bufferBefore` (`:121-122`).
7. A slot is kept if it overlaps no appointment, no blocked window, and is not in the past (`:124-137`). Output carries both UTC ISO strings and `yyyy-LL-dd HH:mm` local strings (`:138-144`).

Frontend: `useAvailableSlots` runs this query once all four params are set; `AvailableSlotPicker` stores the chosen `startTimeLocal` with the space replaced by `T` (`AvailableSlotPicker.tsx:17`) so the backend's `DateTime.fromISO` can parse it.

## Book Appointment

`POST /api/appointments` (role ≥ `CUSTOMER`, `appointments.routes.ts:19`). The controller spreads `req.body` and adds `createdById` from the token (`appointments.controller.ts`).

1. Everything runs in one `prisma.$transaction` (`:46`).
2. Service must exist and be active; staff must exist and be active; staff must offer the service (`:47-68`).
3. `convertLocalToUtc` turns the local wall time into a UTC Luxon `DateTime`; end = start + `durationMinutes` (`:70-71`). Past starts are rejected (`:73-75`).
4. Overlap check: any `REQUESTED`/`CONFIRMED` appointment for this staff with `start < newEnd && end > newStart` → `409 APPOINTMENT_CONFLICT` (`:77-94`).
5. Insert the appointment as `CONFIRMED` (`:96-108`), an `APPOINTMENT_BOOKED` activity (`:110-122`), and an audit event (`:124-131`, written with `tx.auditEvent.create` directly instead of the `createAuditEvent` helper the other methods use).
6. Look up the customer email and insert three notifications: confirmation now, reminders at T-24h and T-1h (`:133-156`).

What it does **not** do: check availability windows or blocked time, check that `customerId` belongs to the caller, or prevent two simultaneous requests from both passing step 4 (there is no exclusion constraint on `Appointment` in `schema.prisma`, and Postgres's default READ COMMITTED isolation lets both transactions read "no conflict").

## Cancel Appointment

`POST /api/appointments/:id/cancel` (role ≥ `CUSTOMER`, `appointments.routes.ts:21`).

1. `getById` loads the appointment with customer, staff, service, notifications, and activities (`:167`, repository `getById`).
2. `assertValidAppointmentTransition(status, CANCELLED)` — legal from `REQUESTED` and `CONFIRMED` (`:168`).
3. Transaction (`:170-207`): update by **id only** to `CANCELLED` with reason and timestamp; write activity; write audit via `createAuditEvent`; insert an `APPOINTMENT_CANCELLED` notification (status defaults to `PENDING`).
4. After commit, `cancelFutureNotificationsForAppointment` sets **every** `PENDING` notification for the appointment to `CANCELLED` (`:209`, `notifications.service.ts:37-47`).

Step 4 also catches the cancellation notice inserted in step 3, so the customer is never told about the cancellation. Step 4 is also outside the transaction: if it fails, the appointment is cancelled but its reminders stay `PENDING`.

## Reschedule Appointment

`POST /api/appointments/:id/reschedule` (role ≥ `CUSTOMER`, `appointments.routes.ts:22`).

1. Load, then check `status -> RESCHEDULED` is legal (only from `CONFIRMED`), then validate the timezone (`:220-222`).
2. Convert the new local start to UTC; end = start + the service duration (`:224-225`).
3. Overlap check via `appointmentsRepository.findConflict`, excluding this appointment's own id — **outside** any transaction (`:227-236`).
4. Transaction (`:238-280`): update start, end, timezone and set status back to `CONFIRMED`; activity with old and new start; audit; insert an `APPOINTMENT_RESCHEDULED` notification.
5. After commit: cancel all `PENDING` notifications (which again includes the notice from step 4), then insert fresh T-24h and T-1h reminders (`:282-299`).

## Complete / No-show

`POST /:id/complete` and `POST /:id/no-show` (role ≥ `STAFF`). Both load, check the transition, then update inside a transaction and write activity + audit. Both update `where: { id }` only — `complete` at `:308-314`, `markNoShow` at `:339-344` — so neither notices a status change committed after its read. (The canonical `buildscedulingpyjs` repo later made `complete` a compare-and-set that maps Prisma's `P2025` to `409 APPOINTMENT_STATUS_CHANGED`; that fix is not in this snapshot.)

## Create Recurring Appointments

`POST /api/appointments/recurring` (role ≥ `SCHEDULER`) → `recurrenceService.createSeries` (`recurrence.service.ts:49`).

1. Transaction; load service; insert the `RecurrenceSeries` row with `startTimeLocal` formatted `HH:mm` in the series timezone (`:63-82`).
2. `generateOccurrences` (`:19-46`) starts a zoned cursor at the first local start and steps by `days`/`weeks`/`months` × `interval`, stopping at `count`, at `untilDateUtc`, or at the hard cap of 52 (`:91`). Because the cursor is zoned, 09:00 stays 09:00 local across a DST change.
3. For each occurrence: convert to UTC, run the same overlap query as booking, throw `409 RECURRENCE_CONFLICT` on the first hit (rolling back the whole series), else insert a `CONFIRMED` appointment linked to the series (`:96-130`).
4. One audit event with `appointmentCount` (`:132-138`).

No notifications are created for recurring occurrences, and the occurrences skip the staff-offers-service and active checks that `book` performs.

Cancelling a series (`:161-197`) sets `cancelledAt`, bulk-updates its `REQUESTED`/`CONFIRMED`/`RESCHEDULED` appointments to `CANCELLED`, and audits `appointmentCount: series.appointments.length` — the count of **all** occurrences, including ones that were already completed. It does not cancel their notifications.
