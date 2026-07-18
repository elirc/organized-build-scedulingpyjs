# Scheduling + Appointment Platform

Full-stack scheduling platform scaffolded with React, TypeScript, Express, Prisma, PostgreSQL, Redis, BullMQ, JWT auth, RBAC, and scheduling-focused backend architecture.

## What This Project Covers

This codebase is intentionally broad and architecture-heavy so it can be studied like a realistic production project. It covers:

- Authentication with access and refresh token flows
- RBAC-oriented route protection
- User, staff, customer, and service management
- Staff-service assignments
- Availability windows and blocked time
- Timezone-safe slot generation
- Transactional appointment booking
- Appointment lifecycle actions: cancel, reschedule, complete, no-show
- Recurring appointment series with concrete generated instances
- Notification and reminder records plus BullMQ worker structure
- Calendar and dashboard endpoints
- Frontend feature slices for dashboard, booking, appointments, calendar, availability, staff, customers, and services
- Test scaffolds and documentation for study

## Quick Start

```bash
cp .env.example backend/.env
cp .env.example .env
docker compose up -d
npm install
npm --workspace backend run prisma:generate
npm --workspace backend run prisma:migrate
npm run dev
```

Backend: `http://localhost:4000`
Frontend: `http://localhost:5173`

## Suggested Study Order

1. [backend/prisma/schema.prisma](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/prisma/schema.prisma)
2. [backend/src/shared/utils/timezones.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/shared/utils/timezones.ts)
3. [backend/src/modules/appointments/conflictDetection.service.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/appointments/conflictDetection.service.ts)
4. [backend/src/modules/availability/slotGeneration.service.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/availability/slotGeneration.service.ts)
5. [backend/src/modules/appointments/appointments.service.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/appointments/appointments.service.ts)
6. [backend/src/modules/appointments/appointment.stateMachine.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/appointments/appointment.stateMachine.ts)
7. [backend/src/modules/appointments/recurrence.service.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/appointments/recurrence.service.ts)
8. [backend/src/modules/notifications/notifications.service.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/notifications/notifications.service.ts)
9. [backend/src/modules/calendar/calendar.service.ts](C:/Users/Owner/Desktop/buildScedulingPYJS/backend/src/modules/calendar/calendar.service.ts)
10. [frontend/src/features/booking/BookAppointmentPage.tsx](C:/Users/Owner/Desktop/buildScedulingPYJS/frontend/src/features/booking/BookAppointmentPage.tsx)
11. [frontend/src/features/appointments/pages/AppointmentDetailPage.tsx](C:/Users/Owner/Desktop/buildScedulingPYJS/frontend/src/features/appointments/pages/AppointmentDetailPage.tsx)
12. [frontend/src/features/calendar/components/CalendarGrid.tsx](C:/Users/Owner/Desktop/buildScedulingPYJS/frontend/src/features/calendar/components/CalendarGrid.tsx)

## Notes

- Some screens are intentionally scaffolded more lightly than the core scheduling services because your goal is code study, not a fully polished runtime product.
- The most important code for learning is in the backend scheduling logic and the frontend query/data-flow structure.
- The local environment previously showed incomplete npm installs on this machine, so treat the codebase as implementation-complete for reading purposes first.
