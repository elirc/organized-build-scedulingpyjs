# Contributing

- Keep controllers thin: read `req`, call one service method, write the response.
- Put Zod request schemas beside their module (`*.schemas.ts`) and attach them with `validate(...)` in the route.
- Throw `AppError(code, status, message?)` for anything the client can fix; let infrastructure errors propagate unchanged.
- Use the Luxon helpers in `backend/src/shared/utils/timezones.ts` instead of raw `Date` arithmetic. Expand recurring rules in local time, convert to UTC last.
- Any change that touches time, authorization, or status transitions needs a test. Backend tests are Vitest files beside the code (`*.test.ts`); if you cannot install dependencies, see the no-install technique in [TESTING_GUIDE.md](TESTING_GUIDE.md).
- Before review, walk the checklist in [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md).
