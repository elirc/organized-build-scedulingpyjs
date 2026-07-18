import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireRole } from "../../middleware/requirePermission.middleware.js";
import { usersController } from "./users.controller.js";
import { createUserSchema, listUsersSchema, updateUserSchema, userIdSchema } from "./users.schemas.js";

export const usersRouter = Router();

usersRouter.get("/", requireRole(Role.MANAGER), validate(listUsersSchema), asyncHandler(usersController.list));
usersRouter.post("/", requireRole(Role.MANAGER), validate(createUserSchema), asyncHandler(usersController.create));
usersRouter.get("/:id", requireRole(Role.MANAGER), validate(userIdSchema), asyncHandler(usersController.getById));
usersRouter.patch("/:id", requireRole(Role.MANAGER), validate(updateUserSchema), asyncHandler(usersController.update));
usersRouter.delete("/:id", requireRole(Role.SYSTEM_ADMIN), validate(userIdSchema), asyncHandler(usersController.remove));

