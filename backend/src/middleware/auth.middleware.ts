import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../shared/utils/jwt.js";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch {
    req.user = undefined;
  }

  return next();
}
