import * as progressService from "../service/lessonProgress.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const completeLesson = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    200,
    "Lesson completed successfully",
    await progressService.completeLesson(req.params.lessonId, req.user),
  ),
);

export const getClassProgress = catchAsync(async (req, res) =>
  sendSuccess(
    res,
    200,
    "Progress retrieved successfully",
    await progressService.getClassProgress(req.params.classId, req.user),
  ),
);
