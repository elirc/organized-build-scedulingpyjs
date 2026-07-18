import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

export const appointmentsRepository = {
  list() {
    return prisma.appointment.findMany({
      include: {
        customer: true,
        staff: true,
        service: true,
        notifications: true
      },
      orderBy: {
        startTimeUtc: "asc"
      }
    });
  },
  listForCustomer(customerId: string) {
    return prisma.appointment.findMany({
      where: { customerId },
      include: {
        customer: true,
        staff: true,
        service: true,
        notifications: true
      },
      orderBy: {
        startTimeUtc: "asc"
      }
    });
  },
  getById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        staff: true,
        service: true,
        notifications: true,
        activities: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
  },
  findConflict(staffId: string, startTimeUtc: Date, endTimeUtc: Date, excludeId?: string) {
    return prisma.appointment.findFirst({
      where: {
        staffId,
        id: excludeId ? { not: excludeId } : undefined,
        status: {
          in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED]
        },
        startTimeUtc: {
          lt: endTimeUtc
        },
        endTimeUtc: {
          gt: startTimeUtc
        }
      }
    });
  }
};

