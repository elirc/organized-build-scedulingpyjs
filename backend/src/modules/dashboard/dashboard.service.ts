import { AppointmentStatus } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "../../db/prisma.js";

export const dashboardService = {
  async getSummary() {
    const today = DateTime.utc().startOf("day");
    const tomorrow = today.plus({ days: 1 });

    const [todayCount, totalAppointments, activeStaff] = await Promise.all([
      prisma.appointment.count({
        where: {
          startTimeUtc: { gte: today.toJSDate(), lt: tomorrow.toJSDate() }
        }
      }),
      prisma.appointment.count(),
      prisma.staffProfile.count({
        where: { isActive: true }
      })
    ]);

    return {
      todayAppointments: todayCount,
      totalAppointments,
      activeStaff
    };
  },

  async getAppointmentsByStatus() {
    const rows = await prisma.appointment.groupBy({
      by: ["status"],
      _count: true
    });
    return rows;
  },

  async getUpcomingAppointments() {
    return prisma.appointment.findMany({
      where: {
        startTimeUtc: {
          gte: new Date()
        },
        status: AppointmentStatus.CONFIRMED
      },
      include: {
        customer: true,
        staff: true,
        service: true
      },
      take: 10,
      orderBy: {
        startTimeUtc: "asc"
      }
    });
  },

  async getCancellationRate() {
    const [cancelled, total] = await Promise.all([
      prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
      prisma.appointment.count()
    ]);
    return {
      cancelled,
      total,
      rate: total === 0 ? 0 : cancelled / total
    };
  },

  async getStaffUtilization() {
    const staff = await prisma.staffProfile.findMany({
      include: {
        appointments: {
          where: {
            status: {
              in: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]
            }
          }
        }
      }
    });

    return staff.map((member) => ({
      staffId: member.id,
      displayName: member.displayName,
      appointmentCount: member.appointments.length
    }));
  }
};

