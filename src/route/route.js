import { Router } from "express";
import userRouter from "./users.route.js";
import authRouter from "./auth.route.js";
import uploadRouter from "./upload.route.js";
import classesRouter from "./classes.route.js";
import classMembersRouter from "./classMembers.route.js";
import lessonsRouter, {
  classLessonsRouter,
  classProgressRouter,
} from "./lessons.route.js";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/upload", uploadRouter);
router.use("/classes/:classId/members", classMembersRouter);
router.use("/classes/:classId/lessons", classLessonsRouter);
router.use("/classes/:classId/progress", classProgressRouter);
router.use("/lessons", lessonsRouter);
router.use("/classes", classesRouter);

export default router;
