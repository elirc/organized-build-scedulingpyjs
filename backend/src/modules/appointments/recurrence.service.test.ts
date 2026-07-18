import { describe, expect, it } from "vitest";
import { generateOccurrences } from "./recurrence.service.js";

describe("generateOccurrences", () => {
  it("caps occurrences at max", () => {
    const occurrences = generateOccurrences({
      firstStartTimeLocal: "2026-06-18T09:00:00",
      timezone: "America/Chicago",
      frequency: "WEEKLY",
      interval: 1,
      count: 100,
      maxOccurrences: 52
    });

    expect(occurrences).toHaveLength(52);
  });
});

