# Architecture

## Core Rules

- Store appointment timestamps in UTC.
- Preserve the original timezone for display and recurrence logic.
- Keep business logic in services, not controllers.
- Separate slot generation from booking confirmation.
- Recheck availability and conflicts inside a transaction when booking.

## Backend Shape

- `routes` parse HTTP concerns
- `controllers` translate requests into service calls
- `services` hold business logic
- `repositories` isolate persistence details where logic grows
- `middleware` handles auth, validation, and errors
- `shared/utils` centralizes timezone and scheduling helpers

## Frontend Shape

- `api/` wraps HTTP calls
- `features/` groups pages, hooks, and components by domain
- `auth.store.ts` keeps auth/session state in Zustand
- TanStack Query owns server-state fetching and mutation
- Route protection happens with `RequireAuth` and `RequireRole`

## Scheduling Design

- Availability windows define potential bookable ranges.
- Slot generation evaluates service duration, buffers, blocked windows, and existing appointments.
- Booking performs a second conflict check inside a transaction.
- Recurring appointments generate concrete appointment instances for later cancellation, reminders, and reporting.

## Appointment Lifecycle

- `REQUESTED -> CONFIRMED`
- `REQUESTED -> CANCELLED`
- `CONFIRMED -> CANCELLED`
- `CONFIRMED -> COMPLETED`
- `CONFIRMED -> NO_SHOW`
- `CONFIRMED -> RESCHEDULED`
- `RESCHEDULED -> CONFIRMED`

## Async Notification Flow

1. Booking or lifecycle change creates `Notification` records.
2. A queue sweep enqueues pending notifications.
3. BullMQ workers process reminder or notification jobs.
4. Notification status is updated to `SENT`, `FAILED`, or `CANCELLED`.
