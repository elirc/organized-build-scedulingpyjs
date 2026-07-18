# Senior Engineering Decisions

- UTC storage avoids ambiguous comparisons.
- Timezone is still stored because UTC alone is not enough for display and recurrence.
- Generated recurring instances simplify reminders, reporting, and one-off exceptions.
- Slot generation is intentionally separate from booking because availability is stale by nature.
- Reminder sending belongs in background jobs to keep requests fast and retryable.

Tradeoffs intentionally visible in this learning codebase:

- Some frontend CRUD pages are scaffolded more lightly than the scheduling core because the hard engineering lessons live in the time logic.
- Resource-level authorization is easier to explain than to perfect in one pass; the codebase shows the role-based backbone first.
- Database-level exclusion constraints are described in docs but not fully implemented so the service-layer logic stays easy to read.
