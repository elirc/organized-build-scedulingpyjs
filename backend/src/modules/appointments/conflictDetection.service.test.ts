import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { overlaps } from "./conflictDetection.service.js";

describe("overlaps", () => {
  it("returns true for overlapping windows", () => {
    const startA = DateTime.fromISO("2026-06-18T10:00:00Z");
    const endA = DateTime.fromISO("2026-06-18T11:00:00Z");
    const startB = DateTime.fromISO("2026-06-18T10:30:00Z");
    const endB = DateTime.fromISO("2026-06-18T11:30:00Z");

    expect(overlaps(startA, endA, startB, endB)).toBe(true);
  });

  it("allows back-to-back windows", () => {
    const startA = DateTime.fromISO("2026-06-18T10:00:00Z");
    const endA = DateTime.fromISO("2026-06-18T11:00:00Z");
    const startB = DateTime.fromISO("2026-06-18T11:00:00Z");
    const endB = DateTime.fromISO("2026-06-18T12:00:00Z");

    expect(overlaps(startA, endA, startB, endB)).toBe(false);
  });
});
