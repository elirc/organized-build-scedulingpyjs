import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { parsePagination } from "../../shared/utils/pagination.js";
import { hashPassword } from "../../shared/utils/password.js";
import { createAuditEvent } from "../audit/audit.service.js";

export const usersService = {
  async list(query: { page?: string | number; pageSize?: string | number }) {
    const pagination = parsePagination(query);
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count()
    ]);

    return {
      items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        staffProfile: true,
        customerProfile: true
      }
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND", 404);
    }

    return user;
  },

  async create(actorId: string | undefined, input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "SYSTEM_ADMIN" | "MANAGER" | "SCHEDULER" | "STAFF" | "CUSTOMER" | "READ_ONLY";
    isActive: boolean;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError("EMAIL_ALREADY_EXISTS", 409);
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        isActive: input.isActive
      }
    });

    await createAuditEvent(prisma, {
      actorId,
      entityType: "User",
      entityId: user.id,
      action: "USER_CREATED",
      metadata: { email: user.email, role: user.role }
    });

    return user;
  },

  async update(actorId: string | undefined, id: string, input: {
    firstName?: string;
    lastName?: string;
    role?: "SYSTEM_ADMIN" | "MANAGER" | "SCHEDULER" | "STAFF" | "CUSTOMER" | "READ_ONLY";
    isActive?: boolean;
  }) {
    await this.getById(id);

    const user = await prisma.user.update({
      where: { id },
      data: input
    });

    await createAuditEvent(prisma, {
      actorId,
      entityType: "User",
      entityId: id,
      action: "USER_UPDATED",
      metadata: input
    });

    return user;
  },

  async remove(actorId: string | undefined, id: string) {
    await this.getById(id);
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    await createAuditEvent(prisma, {
      actorId,
      entityType: "User",
      entityId: id,
      action: "USER_DEACTIVATED"
    });

    return user;
  }
};

