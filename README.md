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
- A small test suite (7 Vitest cases) and study documentation

## Quick Start

This export ships no `.env.example`. First create `backend/.env` with the variables `backend/src/config/env.ts` requires (`DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`; the rest have defaults); `docker-compose.yml` hard-codes its own settings and needs no `.env`.

```bash
docker compose up -d
npm install
npm --workspace backend run prisma:generate
npm --workspace backend run prisma:migrate
npm --workspace backend run prisma:seed   # creates the accounts LoginPage pre-fills
npm run dev
```

Backend: `http://localhost:4000`
Frontend: `http://localhost:5173`

## Suggested Study Order

1. [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
2. [backend/src/shared/utils/timezones.ts](backend/src/shared/utils/timezones.ts)
3. [backend/src/modules/appointments/conflictDetection.service.ts](backend/src/modules/appointments/conflictDetection.service.ts)
4. [backend/src/modules/availability/slotGeneration.service.ts](backend/src/modules/availability/slotGeneration.service.ts)
5. [backend/src/modules/appointments/appointments.service.ts](backend/src/modules/appointments/appointments.service.ts)
6. [backend/src/modules/appointments/appointment.stateMachine.ts](backend/src/modules/appointments/appointment.stateMachine.ts)
7. [backend/src/modules/appointments/recurrence.service.ts](backend/src/modules/appointments/recurrence.service.ts)
8. [backend/src/modules/notifications/notifications.service.ts](backend/src/modules/notifications/notifications.service.ts)
9. [backend/src/modules/calendar/calendar.service.ts](backend/src/modules/calendar/calendar.service.ts)
10. [frontend/src/features/booking/BookAppointmentPage.tsx](frontend/src/features/booking/BookAppointmentPage.tsx)
11. [frontend/src/features/appointments/pages/AppointmentDetailPage.tsx](frontend/src/features/appointments/pages/AppointmentDetailPage.tsx)
12. [frontend/src/features/calendar/components/CalendarGrid.tsx](frontend/src/features/calendar/components/CalendarGrid.tsx)

## Documentation Map

Each guide has one job; they point at each other instead of repeating content.

| Read this | When you want |
| --- | --- |
| [LEARNING_GUIDE.md](LEARNING_GUIDE.md) | the study route through the code, in order, with what to notice at each stop |
| [ARCHITECTURE.md](ARCHITECTURE.md) | the layer rules, lifecycle, and notification pipeline as the code actually implements them |
| [FEATURE_WALKTHROUGHS.md](FEATURE_WALKTHROUGHS.md) | line-by-line traces of booking, slot generation, cancel, reschedule, and recurring series |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | what tests exist, how to run them without installing anything, and what is untested |
| [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) | symptom → file:line lookup table |
| [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md) | review checklist plus the verified defects a senior reviewer would raise today |
| [SENIOR_ENGINEERING_DECISIONS.md](SENIOR_ENGINEERING_DECISIONS.md) | the design trade-offs and what each one costs |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | what must exist before this can run anywhere but a laptop |

## Notes

- Some screens are scaffolded more lightly than the core scheduling services (for example, `BookAppointmentPage.tsx` asks for a raw customer id).
- The most important code for learning is in the backend scheduling logic and the frontend query/data-flow structure.
- You can study most of the backend without installing dependencies by loading the real `.ts` sources under Node 22's built-in type stripping. See [TESTING_GUIDE.md](TESTING_GUIDE.md).
- Snapshot of [elirc/buildscedulingpyjs](https://github.com/elirc/buildscedulingpyjs) taken before its `astraupskill/` course; `appointments.service.ts` here still has the unguarded `complete`, and there is no `tests/` folder or `.env.example`.
