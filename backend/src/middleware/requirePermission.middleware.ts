import type { NextFunction, Response } from "express";
import { Role } from "@prisma/client";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { AppError } from "../shared/errors/AppError.js";

const roleOrder: Record<Role, number> = {
  SYSTEM_ADMIN: 6,
  MANAGER: 5,
  SCHEDULER: 4,
  STAFF: 3,
  CUSTOMER: 2,
  READ_ONLY: 1
};

export function requireRole(minimumRole: Role) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("UNAUTHORIZED", 401));
    }

    const userRole = req.user.role as Role;
    if (roleOrder[userRole] < roleOrder[minimumRole]) {
      return next(new AppError("FORBIDDEN", 403));
    }

    return next();
  };
}
