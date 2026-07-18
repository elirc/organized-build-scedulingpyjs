import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "./auth.schemas.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", validate(refreshSchema), asyncHandler(authController.refresh));
authRouter.post("/logout", validate(logoutSchema), asyncHandler(authController.logout));
authRouter.get("/me", asyncHandler(authController.me));
