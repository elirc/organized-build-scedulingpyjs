import { prisma } from "../../db/prisma.js";

export const availabilityRepository = {
  list() {
    return prisma.availabilityWindow.findMany({
      include: { staff: true },
      orderBy: { createdAt: "desc" }
    });
  },
  listByStaff(staffId: string) {
    return prisma.availabilityWindow.findMany({
      where: { staffId },
      orderBy: [{ isRecurringWeekly: "desc" }, { createdAt: "desc" }]
    });
  },
  getById(id: string) {
    return prisma.availabilityWindow.findUnique({ where: { id } });
  }
};

