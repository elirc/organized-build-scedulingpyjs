import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { parsePagination } from "../../shared/utils/pagination.js";
import { assertValidTimezone } from "../../shared/utils/timezones.js";
import { createAuditEvent } from "../audit/audit.service.js";
import { customersRepository } from "./customers.repository.js";

export const customersService = {
  async list(query: { page?: string | number; pageSize?: string | number }) {
    const pagination = parsePagination(query);
    const [items, total] = await Promise.all([
      customersRepository.list(pagination.skip, pagination.take),
      customersRepository.count()
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  },
  async getById(id: string) {
    const customer = await customersRepository.getById(id);
    if (!customer) {
      throw new AppError("CUSTOMER_NOT_FOUND", 404);
    }
    return customer;
  },
  async create(actorId: string | undefined, input: {
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    timezone?: string;
  }) {
    if (input.timezone) {
      assertValidTimezone(input.timezone);
    }
    const customer = await prisma.customerProfile.create({ data: input });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "CustomerProfile",
      entityId: customer.id,
      action: "CUSTOMER_CREATED"
    });
    return customer;
  },
  async update(actorId: string | undefined, id: string, input: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    timezone?: string | null;
  }) {
    if (input.timezone) {
      assertValidTimezone(input.timezone);
    }
    await this.getById(id);
    const customer = await prisma.customerProfile.update({
      where: { id },
      data: input
    });
    await createAuditEvent(prisma, {
      actorId,
      entityType: "CustomerProfile",
      entityId: id,
      action: "CUSTOMER_UPDATED",
      metadata: input
    });
    return customer;
  },
  async remove(actorId: string | undefined, id: string) {
    await this.getById(id);
    await createAuditEvent(prisma, {
      actorId,
      entityType: "CustomerProfile",
      entityId: id,
      action: "CUSTOMER_DELETED"
    });
    return prisma.customerProfile.delete({ where: { id } });
  }
};

