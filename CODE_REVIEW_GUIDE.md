# Code Review Guide

Review scheduling changes with extra care around:

- UTC and timezone conversions
- overlap logic
- transaction boundaries
- status transitions
- authorization scope
- reminder cancellation on appointment cancellation or reschedule

Good review questions:

1. Does this code preserve the user’s intended local time?
2. Could two requests still create overlapping appointments?
3. Are lifecycle transitions explicit rather than implied?
4. If an appointment changes, do notification records stay consistent?
5. Does the frontend accidentally trust stale slot data?
