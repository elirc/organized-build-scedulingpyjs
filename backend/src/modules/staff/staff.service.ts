import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { parsePagination } from "../../shared/utils/pagination.js";
import { assertValidTimezone } from "../../shared/utils/timezones.js";
import { createAuditEvent } from "../audit/audit.service.js";
import { staffRepository } from "./staff.repository.js";

export const staffService = {
  async list(query: { page?: string | number; pageSize?: string | number }) {
    const pagination = parsePagination(query);
    const [items, total] = await Promise.all([
      staffRepository.list(pagination.skip, pagination.take),
      staffRepository.count()
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  },

  async create(actorId: string | undefined, input: {
    userId: string;
    displayName: string;
    bio?: string;
    timezone: string;
    isActive: boolean;
  }) {
    assertValidTimezone(input.timezone);
    const staff = await prisma.staffProfile.create({
      data: input
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "StaffProfile",
      entityId: staff.id,
      action: "STAFF_CREATED"
    });
    return staff;
  },

  async getById(id: string) {
    const staff = await staffRepository.getById(id);
    if (!staff) {
      throw new AppError("STAFF_NOT_FOUND", 404);
    }
    return staff;
  },

  async update(actorId: string | undefined, id: string, input: {
    displayName?: string;
    bio?: string | null;
    timezone?: string;
    isActive?: boolean;
  }) {
    if (input.timezone) {
      assertValidTimezone(input.timezone);
    }
    await this.getById(id);
    const staff = await prisma.staffProfile.update({
      where: { id },
      data: input
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "StaffProfile",
      entityId: id,
      action: "STAFF_UPDATED",
      metadata: input
    });
    return staff;
  },

  async remove(actorId: string | undefined, id: string) {
    await this.getById(id);
    const staff = await prisma.staffProfile.update({
      where: { id },
      data: { isActive: false }
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "StaffProfile",
      entityId: id,
      action: "STAFF_DEACTIVATED"
    });
    return staff;
  }
};

