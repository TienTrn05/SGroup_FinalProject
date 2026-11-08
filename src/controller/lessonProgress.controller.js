import defaultProgressService from "../service/lessonProgress.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export class LessonProgressController {
  constructor(service = defaultProgressService) {
    this.service = service;
    this.completeLesson = catchAsync(this.completeLesson.bind(this));
    this.getClassProgress = catchAsync(this.getClassProgress.bind(this));
  }

  async completeLesson(req, res) {
    return sendSuccess(
      res,
      200,
      "Lesson completed successfully",
      await this.service.completeLesson(req.params.lessonId, req.user),
    );
  }

  async getClassProgress(req, res) {
    return sendSuccess(
      res,
      200,
      "Progress retrieved successfully",
      await this.service.getClassProgress(req.params.classId, req.user),
    );
  }
}

export default new LessonProgressController();
