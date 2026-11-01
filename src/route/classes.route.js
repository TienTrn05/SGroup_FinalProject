import { Router } from "express";
import * as classesController from "../controller/classes.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  classIdRules,
  createClassRules,
  updateClassRules,
} from "../middleware/classes.validate.js";

const router = Router();
router.use(requireAuth);

router.get("/", classesController.getAllClasses);
router.get("/:classId", validate(classIdRules), classesController.getClassById);
router.post(
  "/",
  requireRole("ADMIN"),
  validate(createClassRules),
  classesController.createClass,
);
router.patch(
  "/:classId",
  requireRole("ADMIN"),
  validate(updateClassRules),
  classesController.updateClass,
);
router.delete(
  "/:classId",
  requireRole("ADMIN"),
  validate(classIdRules),
  classesController.deleteClass,
);

export default router;
