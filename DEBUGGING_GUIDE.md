# Debugging Guide

Start from the symptom, go to the first place listed, and confirm or rule it out before moving on. Lines are in `backend/src/modules/appointments/appointments.service.ts` unless another file is named.

| Symptom | First place to look | What you will usually find |
| --- | --- | --- |
| Any bad request body returns 500 `INTERNAL_SERVER_ERROR` | `middleware/error.middleware.ts:5-21` | It is a `ZodError` from `validate`, not a server bug. The server log (`console.error`, line 15) shows the Zod issues. |
| Appointment shows at the wrong local time | the `timezone` stored on the row vs the zone the UI renders in | UTC is correct; the wrong zone was used for display. For weekly availability, remember slots are placed in the **window's** zone (`slotGeneration.service.ts:88-92`). |
| A slot was listed but booking returns 409 | `:77-94` | Another booking committed between the slot query and this one. Expected; refresh slots. |
| A booking succeeded outside working hours | `:37-160` | `book` does not check availability windows. The caller bypassed the slot list. |
| Two appointments overlap for one staff member | `:77-108`, `schema.prisma` `Appointment` | Concurrent bookings both passed the overlap read; no DB constraint stops them. Check `createdAt` — they will be milliseconds apart. |
| Recurring series is an hour off after March/November | `recurrence.service.ts:23-42` | Only if someone changed the cursor to UTC. As written it steps in local time; confirm the series `timezone` is an IANA name, not an offset. |
| Customer never received a cancellation / reschedule email | `:197-209` / `:270-282`, `notifications.service.ts:37-47` | The notice was created and then cancelled by the same request. Look for `APPOINTMENT_CANCELLED` rows with status `CANCELLED`. |
| 24-hour reminder arrived immediately | `notifications.service.ts:21-35` | The sweep enqueues all `PENDING` rows without checking `scheduledForUtc`. |
| No notification is ever sent | `server.ts`, `jobs/reminder.processor.ts` | No process starts the worker or the sweep. |
| The same email arrived twice | `notifications.service.ts:28-32` | The sweep ran twice while the row was still `PENDING`; jobs have no `jobId`. |
| A customer cancelled someone else's appointment | `appointments.routes.ts:21` | Only the role is checked, not ownership. |
| "Completed" an appointment that was just cancelled | `:304-314` | Expected in this snapshot: `complete` checks the status it read, then updates `where: { id }` with no status predicate, so a cancel committed in between is overwritten. `markNoShow` (`:335-344`) and `reschedule` have the same gap. |
| Selected slot is not highlighted in the booking page | `frontend/src/features/booking/components/AvailableSlotPicker.tsx:16-17` | Stored value has `T`, compared value has a space. |
| Logged out after a page refresh | `frontend/src/auth/auth.store.ts` | Token lives only in memory; refresh token is never used. |
| Frontend calls the wrong API host after deploy | `frontend/src/api/client.ts:4` | `baseURL` is hard-coded; the env variable is unused. |

## Technique

- **Reproduce the service in isolation before reaching for a database.** Load the real service with stubbed collaborators (the technique in [TESTING_GUIDE.md](TESTING_GUIDE.md); this snapshot ships no loader, so you write one or use Vitest mocks). Record every call your stub receives (`updates.push(args)`) and assert on the exact `where` object — most bugs here are a predicate that is missing a field.
- **Print both clocks.** When a time looks wrong, log `startTimeUtc.toISOString()` and `DateTime.fromJSDate(startTimeUtc).setZone(timezone).toISO()` side by side. If the UTC value is right, the bug is in display.
- **Read the activity trail.** `GET /api/appointments/:id/activity` returns the `AppointmentActivity` rows newest first; `AuditEvent` rows carry the actor. Together they reconstruct who did what, in which order.
