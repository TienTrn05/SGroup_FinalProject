import { Router } from "express";
import authController from "../controller/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import {
  registerRules,
  loginRules,
  refreshRules,
  logoutRules,
} from "../middleware/auth.validate.js";

const router = Router();

router.post("/register", validate(registerRules), authController.register);
router.post("/login", validate(loginRules), authController.login);
router.post("/refresh", validate(refreshRules), authController.refresh);
router.post("/logout", validate(logoutRules), authController.logout);
router.get("/me", requireAuth, authController.getMe);

export default router;
