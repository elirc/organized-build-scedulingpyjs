import { DateTime } from "luxon";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { assertValidTimezone } from "../../shared/utils/timezones.js";
import { createAuditEvent } from "../audit/audit.service.js";
import { availabilityRepository } from "./availability.repository.js";

function validateWindow(input: {
  startTimeLocal?: string | null;
  endTimeLocal?: string | null;
  startDateUtc?: string | null;
  endDateUtc?: string | null;
  isRecurringWeekly?: boolean;
}) {
  if (input.isRecurringWeekly) {
    if (!input.startTimeLocal || !input.endTimeLocal || input.startTimeLocal >= input.endTimeLocal) {
      throw new AppError("INVALID_AVAILABILITY_WINDOW", 400, "Recurring availability requires startTimeLocal before endTimeLocal");
    }
    return;
  }

  if (input.startDateUtc && input.endDateUtc) {
    if (DateTime.fromISO(input.startDateUtc) >= DateTime.fromISO(input.endDateUtc)) {
      throw new AppError("INVALID_AVAILABILITY_WINDOW", 400, "startDateUtc must be before endDateUtc");
    }
  }
}

export const availabilityService = {
  async list() {
    return { windows: await availabilityRepository.list() };
  },
  async listByStaff(staffId: string) {
    return { windows: await availabilityRepository.listByStaff(staffId) };
  },
  async create(actorId: string | undefined, input: {
    staffId: string;
    type: "AVAILABLE" | "BLOCKED";
    dayOfWeek?: number;
    startTimeLocal?: string;
    endTimeLocal?: string;
    startDateUtc?: string;
    endDateUtc?: string;
    timezone: string;
    isRecurringWeekly: boolean;
  }) {
    assertValidTimezone(input.timezone);
    validateWindow(input);
    const window = await prisma.availabilityWindow.create({
      data: {
        ...input,
        startDateUtc: input.startDateUtc ? new Date(input.startDateUtc) : undefined,
        endDateUtc: input.endDateUtc ? new Date(input.endDateUtc) : undefined
      }
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "AvailabilityWindow",
      entityId: window.id,
      action: "AVAILABILITY_CREATED",
      metadata: { staffId: input.staffId, type: input.type }
    });
    return window;
  },
  async update(actorId: string | undefined, id: string, input: {
    type?: "AVAILABLE" | "BLOCKED";
    dayOfWeek?: number | null;
    startTimeLocal?: string | null;
    endTimeLocal?: string | null;
    startDateUtc?: string | null;
    endDateUtc?: string | null;
    timezone?: string;
    isRecurringWeekly?: boolean;
  }) {
    const existing = await availabilityRepository.getById(id);
    if (!existing) {
      throw new AppError("AVAILABILITY_NOT_FOUND", 404);
    }
    if (input.timezone) {
      assertValidTimezone(input.timezone);
    }
    validateWindow({
      startTimeLocal: input.startTimeLocal ?? existing.startTimeLocal,
      endTimeLocal: input.endTimeLocal ?? existing.endTimeLocal,
      startDateUtc: input.startDateUtc ?? existing.startDateUtc?.toISOString() ?? null,
      endDateUtc: input.endDateUtc ?? existing.endDateUtc?.toISOString() ?? null,
      isRecurringWeekly: input.isRecurringWeekly ?? existing.isRecurringWeekly
    });
    const window = await prisma.availabilityWindow.update({
      where: { id },
      data: {
        ...input,
        startDateUtc: input.startDateUtc === undefined ? undefined : input.startDateUtc ? new Date(input.startDateUtc) : null,
        endDateUtc: input.endDateUtc === undefined ? undefined : input.endDateUtc ? new Date(input.endDateUtc) : null
      }
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "AvailabilityWindow",
      entityId: id,
      action: "AVAILABILITY_UPDATED",
      metadata: input
    });
    return window;
  },
  async remove(actorId: string | undefined, id: string) {
    const existing = await availabilityRepository.getById(id);
    if (!existing) {
      throw new AppError("AVAILABILITY_NOT_FOUND", 404);
    }
    const window = await prisma.availabilityWindow.delete({ where: { id } });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "AvailabilityWindow",
      entityId: id,
      action: "AVAILABILITY_DELETED"
    });
    return window;
  }
};

