# Senior Engineering Decisions

Each decision below is visible in the code. The "cost" column is what you pay for it; concrete defects are listed separately in [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md).

| Decision | Evidence | Why | Cost |
| --- | --- | --- | --- |
| Store instants in UTC | `Appointment.startTimeUtc/endTimeUtc`; `convertLocalToUtc` | Comparisons and range queries are unambiguous | Display and recurrence need a second field |
| Also store the timezone | `Appointment.timezone`, `RecurrenceSeries.timezone`, `AvailabilityWindow.timezone` | "09:00 every Tuesday in Chicago" is a local rule; UTC alone cannot reproduce it across DST | Every reader must pick the right zone; slot generation uses the window's zone, not the viewer's |
| Materialize recurring occurrences | `recurrence.service.ts:96-130` writes one `Appointment` per occurrence, capped at 52 | Reminders, reporting, and single-occurrence cancel work on ordinary rows | Series edits must touch many rows; long series stop at 52 with no incremental generator (`jobs/recurrence.processor.ts` is a placeholder) |
| All-or-nothing series creation | one conflicting occurrence throws inside the transaction (`:110-112`) | Simple to explain and test | A scheduler cannot accept "10 of 12 fit" without changing the API |
| Separate slot listing from booking | `slotGeneration.service.ts` vs `appointments.service.ts:book` | Slot lists are stale the moment they render; only the write can be authoritative | Booking currently re-checks overlap only, not availability |
| Overlap check in application code | `findFirst` inside the booking transaction | Readable; no raw SQL migration | No database guarantee under concurrency (see review finding 6) |
| Status checked in application code only | every transition reads the row, calls `assertValidAppointmentTransition`, then updates `where: { id }` | No locks, no retry logic, simplest code | A concurrent status change between read and write is silently overwritten (review finding 10). The canonical repo later put the observed status in `complete`'s update predicate; even that cannot see a reschedule→reconfirm cycle |
| Notifications as rows, sending in a worker | `Notification` rows written in the business transaction; BullMQ worker sends | The request stays fast; sends can be retried; the outbox row commits with the business change | The sweep and worker are not wired to any process yet |
| Role ladder, not per-resource policy | `requireRole(min)` on every route | One mental model, easy to audit | No ownership checks (review finding 5) |
| Lightly built CRUD screens | e.g. booking asks for a raw customer id | Effort went to the time logic | The UI cannot be used by a real customer as-is |

## Questions a senior engineer would ask next

- Should the database or the service own the no-overlap invariant? (What happens when a second service, a migration script, or a recurring-series job writes appointments?)
- Should `REQUESTED` exist at all? Nothing writes it today. If approval workflows are planned, booking should start there; if not, the state can be removed.
- Is `RESCHEDULED` a status or an event? The code treats it as an event (activity row) while the state machine treats it as a status.
- Should cancelling a series cancel its notifications and audit only the rows it actually changed?
