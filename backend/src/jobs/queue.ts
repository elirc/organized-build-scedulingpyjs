import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env.js";

export const redisConnection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const notificationQueue = new Queue("notifications", { connection: redisConnection });
export const recurrenceQueue = new Queue("recurrence", { connection: redisConnection });
