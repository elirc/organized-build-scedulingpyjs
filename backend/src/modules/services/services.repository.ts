import { prisma } from "../../db/prisma.js";

export const servicesRepository = {
  list(skip: number, take: number) {
    return prisma.service.findMany({
      skip,
      take,
      include: {
        staffServices: {
          include: {
            staff: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
  },
  count() {
    return prisma.service.count();
  },
  getById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        staffServices: {
          include: {
            staff: true
          }
        }
      }
    });
  }
};

