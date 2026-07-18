# Testing Guide

- Unit tests should cover overlap logic, timezone conversion, state transitions, slot generation, and recurrence.
- Integration tests should cover slot generation, booking conflicts, cancellation, rescheduling, and authorization.
- E2E tests should validate the scheduling flow through the UI.

Suggested backend integration scenarios:

1. Create service, staff profile, and availability window.
2. Generate slots for a date and timezone.
3. Book an appointment into one of those slots.
4. Attempt a conflicting booking and expect `409`.
5. Reschedule to an open slot and verify reminder regeneration.
6. Cancel and verify pending notifications move to `CANCELLED`.

Suggested frontend scenarios:

1. Login as scheduler.
2. Visit dashboard and ensure summary widgets render.
3. Open booking flow, choose service/staff/date, and submit.
4. Open appointment detail and cancel or reschedule.
5. Switch calendar timezone and verify rendering changes.
