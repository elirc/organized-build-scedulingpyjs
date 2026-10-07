# Deployment Guide

The repo ships `backend/Dockerfile`, `frontend/Dockerfile`, and a `docker-compose.yml` that runs **only Postgres 16 and Redis 7** for local development. Nothing here has been deployed; this page lists what has to exist first.

## Processes you need

| Process | Command today | Gap |
| --- | --- | --- |
| API | `npm --workspace backend run build` then `npm --workspace backend start` (`node dist/server.js`) | — |
| Notification worker | none | `jobs/reminder.processor.ts` exports a `Worker` but no entry file imports it. Add e.g. `src/worker.ts` that imports it and a `start:worker` script. |
| Notification sweep | none (manual `POST /api/notifications/enqueue` as a manager) | Needs a scheduler (BullMQ repeatable job or platform cron) and must filter `scheduledForUtc <= now` first (see CODE_REVIEW_GUIDE.md finding 8). |
| Frontend | `npm --workspace frontend run build`, serve `dist/` statically | `src/api/client.ts` hard-codes `http://localhost:4000/api`; switch it to `import.meta.env.VITE_API_BASE_URL` before building for any other host. |

## Configuration

`backend/src/config/env.ts` parses the environment with Zod at import time and throws (crashing the process) on a missing `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET`. `FRONTEND_URL` drives CORS (`app.ts`); set it to the deployed frontend origin.

## Database

There is no `backend/prisma/migrations/` directory in the repo; `npm --workspace backend run prisma:migrate` (`prisma migrate dev`) creates the first migration locally. Commit that migration and use `prisma migrate deploy` in production. If you add the overlap exclusion constraint (finding 6), it goes into that migration as raw SQL and requires the `btree_gist` extension.

## Before calling it production

- Fix review findings 1 (self-assigned admin role) and 4 (password hash in responses).
- Decide on refresh-token handling in the frontend; access tokens default to `15m` (`env.ts`).
- Seed only in non-production: `prisma/seed.ts` creates five users sharing the password `Password123!`.
