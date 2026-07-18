import { Worker } from "bullmq";
import { redisConnection } from "./queue.js";
import { notificationsService } from "../modules/notifications/notifications.service.js";

export const reminderWorker = new Worker(
  "notifications",
  async (job) => {
    if (job.name === "send-notification") {
      return notificationsService.processNotification(String(job.data.notificationId));
    }
    return null;
  },
  {
    connection: redisConnection
  }
);

