# Testing Guide

## What exists today

| Suite | Files | Cases | Runner |
| --- | --- | --- | --- |
| Backend unit | `appointment.stateMachine.test.ts` (3), `conflictDetection.service.test.ts` (2), `recurrence.service.test.ts` (1), `shared/utils/timezones.test.ts` (1) | 7 | Vitest (`npm --workspace backend run test`) — needs `npm install` |
| Frontend | none | 0 | `vitest run` is configured but finds no test files |

CI (`.github/workflows/ci.yml`) runs `npm install`, `npm run typecheck`, `npm run test`. The root `test` script runs the backend suite and then the frontend suite; with no frontend test files, `vitest run` exits non-zero by default, so expect that step to fail until a frontend test (or `--passWithNoTests`) is added.

## Running tests with no install

This snapshot has no `tests/` folder. The canonical `buildscedulingpyjs` repo adds `tests/helpers-load-typescript.mjs`, which loads a real `.ts` file through Node's built-in `stripTypeScriptTypes` (Node 22.13+) inside a `vm` context, with every non-relative import supplied as a stub, and runs it with `node --experimental-vm-modules --test`. You can write the same loader here in about fifty lines; its useful property is to throw `Unstubbed external dependency: <name>` if the code under test reaches `luxon`, `@prisma/client`, `bullmq`, etc. without a stub. That error is a feature: it shows you exactly which collaborators a unit really has. Pure modules need very little — `appointment.stateMachine.ts` only needs `@prisma/client` stubbed with an `AppointmentStatus` object; `middleware/error.middleware.ts` needs nothing at all.

What this technique proves: the real control flow of the loaded file, against collaborators you describe. What it cannot prove: Prisma query semantics, Postgres isolation, Express wiring, or anything a stub hides. Say so in any PR that relies on it.

## What is untested (highest value first)

1. **Booking under concurrency.** Two transactions can both pass the overlap read. Needs a real Postgres test, or a fake transaction that interleaves two `book` calls.
2. **Notification side effects of cancel/reschedule.** The cancellation and reschedule notices are cancelled by the method that created them (CODE_REVIEW_GUIDE.md finding 2).
3. **HTTP error mapping.** Invalid input returns 500 because `ZodError` is not an `AppError` (finding 3).
4. **Status transitions under concurrency.** `cancel`, `reschedule`, `complete`, and `markNoShow` all update by id only (finding 10); a stubbed `tx.appointment.update` that records its `where` argument proves it without a database.
5. **Authorization scope.** Any `CUSTOMER` token can cancel or reschedule any appointment id; no test covers ownership.
6. **Slot generation.** No test covers buffers, blocked windows, weekday mapping, or a DST date. `generateAvailableSlots` takes `prisma` as a parameter (`slotGeneration.service.ts:9`), so it is the easiest service to test with a fake — only `luxon` and `@prisma/client` need real or stubbed versions.
7. **Frontend.** Nothing. The slot picker's selected-state bug (CODE_REVIEW_GUIDE.md finding 9) is the kind of thing a single component test would catch.

## Suggested integration scenarios (need Postgres)

1. Create service, staff profile, `StaffService`, and a weekly availability window; request slots for a date and timezone; assert count and first/last slot.
2. Book one of those slots; book it again → `409 APPOINTMENT_CONFLICT`.
3. Book at 03:00 local through the API (bypassing slots) → today this **succeeds**; decide whether it should.
4. Reschedule to an open slot; assert two new `PENDING` reminders and the old ones `CANCELLED`.
5. Cancel; assert the appointment is `CANCELLED` and — after fixing finding 2 — exactly one `PENDING` cancellation notice remains.
6. Send a malformed body (`{}`) to `POST /api/appointments`; assert 400 once finding 3 is fixed.

## Suggested UI scenarios

1. Log in as the seeded scheduler (`LoginPage.tsx` pre-fills `scheduler@example.com` / `Password123!`).
2. Book via **Book Appointment**: service → staff → date → slot → customer id.
3. Open the appointment detail and cancel or reschedule.
4. Switch calendar timezone and check the same appointment moves on the grid.
