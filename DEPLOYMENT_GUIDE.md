# Deployment Guide

- Frontend: Vercel or similar static host
- Backend: Render, Railway, Fly.io, or container platform
- Database: managed PostgreSQL
- Queue: managed Redis

Before deploying, run migrations, seed representative data, and verify background workers use the production Redis URL.

Recommended production split:

- `web-backend`: Express API
- `worker-notifications`: BullMQ reminder worker
- `postgres`: managed database
- `redis`: managed queue store
- `web-frontend`: static frontend
