import { Router } from "express";
import * as classMembersController from "../controller/classMembers.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { classIdRules } from "../middleware/classes.validate.js";
import {
  addClassMemberRules,
  removeClassMemberRules,
} from "../middleware/classMembers.validate.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get("/", validate(classIdRules), classMembersController.getClassMembers);
router.post(
  "/",
  requireRole("ADMIN"),
  validate(addClassMemberRules),
  classMembersController.addClassMember,
);
router.delete(
  "/:memberId",
  requireRole("ADMIN"),
  validate(removeClassMemberRules),
  classMembersController.removeClassMember,
);

export default router;
