import { describe, expect, it } from "vitest";
import { AppointmentStatus } from "@prisma/client";
import { assertValidAppointmentTransition, getAllowedAppointmentTransitions } from "./appointment.stateMachine.js";

describe("appointment state machine", () => {
  it("allows confirmed to cancelled", () => {
    expect(() => assertValidAppointmentTransition(AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED)).not.toThrow();
  });

  it("blocks completed to confirmed", () => {
    expect(() => assertValidAppointmentTransition(AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED)).toThrow();
  });

  it("returns allowed transitions", () => {
    expect(getAllowedAppointmentTransitions(AppointmentStatus.REQUESTED)).toContain(AppointmentStatus.CONFIRMED);
  });
});

