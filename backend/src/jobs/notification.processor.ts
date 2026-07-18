import { notificationsService } from "../modules/notifications/notifications.service.js";

export async function runNotificationSweep() {
  return notificationsService.enqueuePendingNotifications();
}

