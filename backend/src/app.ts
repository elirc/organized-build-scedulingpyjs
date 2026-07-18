import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { servicesRouter } from "./modules/services/services.routes.js";
import { staffRouter } from "./modules/staff/staff.routes.js";
import { customersRouter } from "./modules/customers/customers.routes.js";
import { availabilityRouter } from "./modules/availability/availability.routes.js";
import { appointmentsRouter } from "./modules/appointments/appointments.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { calendarRouter } from "./modules/calendar/calendar.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(requestLogger);
  app.use(authMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/staff", staffRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/availability", availabilityRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/calendar", calendarRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(errorMiddleware);

  return app;
}
