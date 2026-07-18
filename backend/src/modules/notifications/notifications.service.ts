import { NotificationStatus, NotificationType } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/AppError.js";
import { notificationQueue } from "../../jobs/queue.js";
import { emailService } from "./email.service.js";

export const notificationsService = {
  async list() {
    const notifications = await prisma.notification.findMany({
      include: {
        appointment: true
      },
      orderBy: {
        scheduledForUtc: "asc"
      }
    });

    return { notifications };
  },

  async enqueuePendingNotifications() {
    const notifications = await prisma.notification.findMany({
      where: {
        status: NotificationStatus.PENDING
      }
    });

    await Promise.all(
      notifications.map((notification) =>
        notificationQueue.add("send-notification", { notificationId: notification.id })
      )
    );

    return notifications.length;
  },

  async cancelFutureNotificationsForAppointment(appointmentId: string) {
    return prisma.notification.updateMany({
      where: {
        appointmentId,
        status: NotificationStatus.PENDING
      },
      data: {
        status: NotificationStatus.CANCELLED
      }
    });
  },

  async processNotification(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        appointment: {
          include: {
            customer: true,
            staff: true,
            service: true
          }
        }
      }
    });

    if (!notification) {
      throw new AppError("NOTIFICATION_NOT_FOUND", 404);
    }

    if (notification.status === NotificationStatus.CANCELLED) {
      return notification;
    }

    const subjectMap: Record<NotificationType, string> = {
      APPOINTMENT_CONFIRMATION: "Appointment Confirmed",
      APPOINTMENT_CANCELLED: "Appointment Cancelled",
      APPOINTMENT_RESCHEDULED: "Appointment Rescheduled",
      APPOINTMENT_REMINDER: "Appointment Reminder"
    };

    try {
      await emailService.send({
        recipientEmail: notification.recipientEmail,
        subject: subjectMap[notification.type],
        body: `${notification.type} for ${notification.appointment.service.name} with ${notification.appointment.staff.displayName}`
      });

      return prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          attempts: { increment: 1 }
        }
      });
    } catch (error) {
      return prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : "Unknown notification error"
        }
      });
    }
  }
};

