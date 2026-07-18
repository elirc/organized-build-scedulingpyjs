# Learning Guide

Scheduling systems look simple until timezone, daylight saving time, overlap detection, and race conditions enter the picture.

Study this codebase in this order:

1. Prisma schema
2. RBAC permissions
3. Timezone utilities
4. Overlap detection
5. Slot generation
6. Booking transaction
7. Recurrence generation
8. Notification job flow

What to watch for while studying:

- Slot generation is advisory. Booking is authoritative.
- UTC storage solves only storage and comparison, not recurrence intent.
- Back-to-back appointments are not overlaps unless buffers extend them into each other.
- Reminder scheduling is a separate concern from booking confirmation.
- Calendar pages become state-heavy quickly because timezone, filters, and range selection all interact.
