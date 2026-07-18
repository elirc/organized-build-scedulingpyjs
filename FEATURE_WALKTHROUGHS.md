# Feature Walkthroughs

## Book Appointment

1. Frontend loads services, staff, and slots.
2. User chooses local time and timezone.
3. Backend converts local input to UTC.
4. Backend validates availability and conflicts.
5. Appointment, activity, audit, and notification records are created together.

## Cancel Appointment

1. Lifecycle endpoint validates the state transition.
2. Appointment is marked cancelled.
3. Future reminders are cancelled.
4. Cancellation notification is queued.
5. Activity and audit records are created.

## Reschedule Appointment

1. User provides a new local time and timezone.
2. Backend converts that local time to UTC.
3. Conflict detection re-runs on the new slot.
4. Reminder records are regenerated.
5. Activity and audit records capture the old and new time.

## Create Recurring Appointments

1. Series metadata is stored.
2. Concrete occurrences are generated in local time.
3. Each occurrence is converted to UTC for storage.
4. Any conflict fails the full series in the MVP design.
