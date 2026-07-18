import { prisma } from "../../db/prisma.js";

export const staffRepository = {
  list(skip: number, take: number) {
    return prisma.staffProfile.findMany({
      skip,
      take,
      include: {
        user: true,
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: { displayName: "asc" }
    });
  },
  count() {
    return prisma.staffProfile.count();
  },
  getById(id: string) {
    return prisma.staffProfile.findUnique({
      where: { id },
      include: {
        user: true,
        services: { include: { service: true } },
        availabilityWindows: true,
        appointments: true
      }
    });
  }
};

