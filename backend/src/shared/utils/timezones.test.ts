import { describe, expect, it } from "vitest";
import { convertLocalToUtc } from "./timezones.js";

describe("timezone utilities", () => {
  it("converts local time to utc", () => {
    const value = convertLocalToUtc("2026-06-18T10:00:00", "America/Chicago");
    expect(value.toISO()).toContain("15:00:00.000Z");
  });
});
