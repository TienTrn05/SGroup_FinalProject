import { Router } from "express";
import lessonsController from "../controller/lessons.controller.js";
import progressController from "../controller/lessonProgress.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { classIdRules } from "../middleware/classes.validate.js";
import {
  lessonIdRules,
  createLessonRules,
  updateLessonRules,
  completeLessonRules,
} from "../middleware/lessons.validate.js";

export const classLessonsRouter = Router({ mergeParams: true });
classLessonsRouter.use(requireAuth);
classLessonsRouter.get(
  "/",
  validate(classIdRules),
  lessonsController.getClassLessons,
);
classLessonsRouter.post(
  "/",
  validate(createLessonRules),
  lessonsController.createLesson,
);

export const classProgressRouter = Router({ mergeParams: true });
classProgressRouter.use(requireAuth);
classProgressRouter.get(
  "/",
  validate(classIdRules),
  progressController.getClassProgress,
);

const router = Router();
router.use(requireAuth);
router.get(
  "/:lessonId",
  validate(lessonIdRules),
  lessonsController.getLessonById,
);
router.patch(
  "/:lessonId",
  validate(updateLessonRules),
  lessonsController.updateLesson,
);
router.delete(
  "/:lessonId",
  validate(lessonIdRules),
  lessonsController.deleteLesson,
);
router.post(
  "/:lessonId/complete",
  validate(completeLessonRules),
  progressController.completeLesson,
);

export default router;
