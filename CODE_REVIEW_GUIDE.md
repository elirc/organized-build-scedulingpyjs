# Code Review Guide

## Checklist for any scheduling change

1. **Local intent.** Does the code keep the user's wall-clock time and timezone, and convert to UTC only at the boundary (`convertLocalToUtc`)? Recurrence must step in local time.
2. **Overlap.** Is the half-open rule `start < otherEnd && end > otherStart` used consistently? Are buffers part of the comparison or not — and is that deliberate?
3. **Concurrency.** Between the read that justified a write and the write itself, could another request change the row? Is the guard in the database predicate (e.g. `where: { id, status }` with Prisma's `P2025` mapped to a 409) or only in application code? In this snapshot no status write has such a predicate (finding 10).
4. **Transaction boundary.** Are all side effects (activity, audit, notifications) inside the same transaction as the state change, or deliberately outside with a reason?
5. **Lifecycle.** Is the transition checked with `assertValidAppointmentTransition`, and is the status that gets written the one that was checked?
6. **Authorization scope.** `requireRole` checks a minimum role only. Does the change also need "is this *your* appointment / customer / staff profile"?
7. **Notifications.** If the appointment changes, does every `PENDING` row still describe something that should happen?
8. **Errors.** Does a client mistake produce a 4xx `AppError`, and does an infrastructure failure keep its original identity?

## Verified findings in the current code

Each item was confirmed by reading the cited lines. Items marked **(reproduced)** have a runnable reproduction in the canonical `buildscedulingpyjs` repo's `astraupskill/05-PRACTICE.md`; that course and its `tests/` harness are not part of this snapshot. Numbered so other docs can refer to them.

**1. Anyone can register as `SYSTEM_ADMIN`.** `POST /api/auth/register` has no `requireRole` (`modules/auth/auth.routes.ts:9`), and `registerSchema` accepts `role` from the body with any of the six values (`modules/auth/auth.schemas.ts:9`). `authService.register` writes it unchanged. Fix: drop `role` from the public schema and default to `CUSTOMER`; create staff accounts through `/api/users` behind `requireRole(MANAGER)`.

**2. Cancel and reschedule cancel their own customer notice. (reproduced)** `cancel` inserts an `APPOINTMENT_CANCELLED` notification inside its transaction (`appointments.service.ts:197-204`), then after commit calls `cancelFutureNotificationsForAppointment`, which flips every `PENDING` row for that appointment — including the one just inserted — to `CANCELLED` (`:209`; `notifications.service.ts:37-47`). `reschedule` does the same to its `APPOINTMENT_RESCHEDULED` notice (`:270-277`, `:282`). Fix: cancel pending rows inside the transaction *before* inserting the notice, or restrict the bulk cancel to `type: APPOINTMENT_REMINDER`.

**3. Every validation failure is a 500. (reproduced)** `validate` forwards the `ZodError` (`middleware/validate.middleware.ts:13`); `errorMiddleware` only recognizes `AppError` and maps everything else to `500 INTERNAL_SERVER_ERROR` (`middleware/error.middleware.ts:5-21`). A typo in a request body pages on-call. Fix: add an `instanceof ZodError` branch that returns 400 with `error.issues`.

**4. Auth responses include the password hash.** `register` responds with the full Prisma `User` (`auth.controller.ts:8`), and `login` returns `{ user, accessToken, refreshToken }` with the same full row (`auth.service.ts:49-53`, `auth.controller.ts:13`). `User.passwordHash` is a column (`schema.prisma:13`). Fix: `select` or map to a DTO.

**5. Role checks without ownership checks.** Book, cancel, and reschedule require only `CUSTOMER` (`appointments.routes.ts:19,21,22`). Nothing compares `req.user` with the appointment's customer, and `book` trusts `customerId` from the body. Any customer can cancel any appointment whose id they learn.

**6. Booking can double-book under concurrency. (reproduced against a fake)** The overlap check is a plain `findFirst` inside a READ COMMITTED transaction (`appointments.service.ts:77-94`); there is no exclusion constraint or unique index that the database would enforce. Two requests can both read "no conflict" and both insert. `SENIOR_ENGINEERING_DECISIONS.md` records this as a deliberate simplification; the fix is a Postgres `EXCLUDE USING gist (staff_id WITH =, tstzrange(start_time_utc, end_time_utc) WITH &&) WHERE (status IN (...))` added through a raw SQL migration, or serializable isolation with retry.

**7. Booking ignores availability.** `book` never reads `AvailabilityWindow` (`appointments.service.ts:37-160`). The slot list is the only thing keeping bookings inside working hours, and the API is callable directly.

**8. The notification pipeline is not production-shaped.** `enqueuePendingNotifications` enqueues every `PENDING` row regardless of `scheduledForUtc`, so the T-24h reminder is sent on the first sweep, and it passes no `jobId`, so repeated sweeps enqueue duplicates (`notifications.service.ts:21-35`). Nothing imports `jobs/reminder.processor.ts` or `jobs/notification.processor.ts`; `server.ts` starts only the HTTP listener.

**9. The slot picker never shows a selection.** `AvailableSlotPicker` stores `slot.startTimeLocal.replace(" ", "T")` (`frontend/src/features/booking/components/AvailableSlotPicker.tsx:17`) but highlights by comparing `value === slot.startTimeLocal` (`:16`), which still has the space. The comparison is never true.

**10. No status transition is race-safe.** `cancel` (`:171-178`), `reschedule` (`:239-247`), `complete` (`:308-314`), and `markNoShow` (`:339-344`) update by id only, so a concurrent change between the status read and the write is overwritten — a `complete` can land on an appointment that was cancelled a moment earlier. `reschedule` also runs its overlap check before opening its transaction (`:227-236`).

**11. Small but real.** `requestLogger` only stamps a header and logs nothing (`middleware/requestLogger.middleware.ts:3-6`). The role ladder is duplicated (`shared/utils/permissions.ts:3-10`, `middleware/requirePermission.middleware.ts:6-13`). The frontend ignores `VITE_API_BASE_URL` (`frontend/src/api/client.ts:4`).

## How to use these in review practice

Pick a finding, cover its explanation, and review the cited function cold. Write your comment as you would on a PR: the risk, the evidence (file:line), the smallest fix, and the test that would prove it. Then compare. Findings 2, 3, 6 and 10 are good "write the failing test first" practice; 1, 4, 5 are good "write the security review comment" practice.
