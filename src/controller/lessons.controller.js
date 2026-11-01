import * as lessonsService from "../service/lessons.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getClassLessons = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    200,
    "Lessons retrieved successfully",
    await lessonsService.getClassLessons(req.params.classId, req.user),
  ),
);

export const getLessonById = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    200,
    "Lesson retrieved successfully",
    await lessonsService.getLessonById(req.params.lessonId, req.user),
  ),
);

export const createLesson = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    201,
    "Lesson created successfully",
    await lessonsService.createLesson(req.params.classId, req.body, req.user),
  ),
);

export const updateLesson = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    200,
    "Lesson updated successfully",
    await lessonsService.updateLesson(req.params.lessonId, req.body, req.user),
  ),
);

export const deleteLesson = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    200,
    "Lesson deleted successfully",
    await lessonsService.deleteLesson(req.params.lessonId, req.user),
  ),
);
