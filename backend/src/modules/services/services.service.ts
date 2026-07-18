import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { parsePagination } from "../../shared/utils/pagination.js";
import { createAuditEvent } from "../audit/audit.service.js";
import { servicesRepository } from "./services.repository.js";

export const servicesService = {
  async list(query: { page?: string | number; pageSize?: string | number }) {
    const pagination = parsePagination(query);
    const [items, total] = await Promise.all([
      servicesRepository.list(pagination.skip, pagination.take),
      servicesRepository.count()
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  },
  async getById(id: string) {
    const service = await servicesRepository.getById(id);
    if (!service) {
      throw new AppError("SERVICE_NOT_FOUND", 404);
    }
    return service;
  },
  async create(actorId: string | undefined, input: {
    name: string;
    description?: string;
    durationMinutes: number;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    isActive: boolean;
  }) {
    const service = await prisma.service.create({ data: input });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "Service",
      entityId: service.id,
      action: "SERVICE_CREATED"
    });
    return service;
  },
  async update(actorId: string | undefined, id: string, input: {
    name?: string;
    description?: string | null;
    durationMinutes?: number;
    bufferBeforeMinutes?: number;
    bufferAfterMinutes?: number;
    isActive?: boolean;
  }) {
    await this.getById(id);
    const service = await prisma.service.update({
      where: { id },
      data: input
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "Service",
      entityId: id,
      action: "SERVICE_UPDATED",
      metadata: input
    });
    return service;
  },
  async remove(actorId: string | undefined, id: string) {
    await this.getById(id);
    const service = await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "Service",
      entityId: id,
      action: "SERVICE_DEACTIVATED"
    });
    return service;
  },
  async assignStaff(actorId: string | undefined, serviceId: string, staffId: string) {
    await this.getById(serviceId);
    const assignment = await prisma.staffService.upsert({
      where: {
        staffId_serviceId: {
          staffId,
          serviceId
        }
      },
      update: {},
      create: {
        staffId,
        serviceId
      }
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "StaffService",
      entityId: assignment.id,
      action: "STAFF_ASSIGNED_TO_SERVICE",
      metadata: { staffId, serviceId }
    });
    return assignment;
  }
};

