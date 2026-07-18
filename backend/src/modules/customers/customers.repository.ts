import { prisma } from "../../db/prisma.js";

export const customersRepository = {
  list(skip: number, take: number) {
    return prisma.customerProfile.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });
  },
  count() {
    return prisma.customerProfile.count();
  },
  getById(id: string) {
    return prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: {
          include: {
            service: true,
            staff: true
          }
        }
      }
    });
  }
};

