import type { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  req.headers["x-request-received-at"] = new Date().toISOString();
  next();
}

