# Debugging Guide

## Common Failures

- Wrong local time display: inspect UTC storage plus timezone conversion.
- Slot visible but booking fails: another booking may have won the race between slot lookup and confirmation.
- Recurrence shifted by one hour: verify local recurrence generation across DST boundaries.
- Customer can see another customer’s appointment: inspect role checks plus resource-scoping logic.
- Reminder sent for cancelled appointment: confirm pending notifications are cancelled during lifecycle updates.
- Staff double-booked: inspect overlap logic and ensure booking conflict checks happen inside the transaction.
