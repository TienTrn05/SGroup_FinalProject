import defaultLessonsService from "../service/lessons.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export class LessonsController {
  constructor(service = defaultLessonsService) {
    this.service = service;
    this.getClassLessons = catchAsync(this.getClassLessons.bind(this));
    this.getLessonById = catchAsync(this.getLessonById.bind(this));
    this.createLesson = catchAsync(this.createLesson.bind(this));
    this.updateLesson = catchAsync(this.updateLesson.bind(this));
    this.deleteLesson = catchAsync(this.deleteLesson.bind(this));
  }

  async getClassLessons(req, res) {
    return sendSuccess(
      res,
      200,
      "Lessons retrieved successfully",
      await this.service.getClassLessons(req.params.classId, req.user),
    );
  }

  async getLessonById(req, res) {
    return sendSuccess(
      res,
      200,
      "Lesson retrieved successfully",
      await this.service.getLessonById(req.params.lessonId, req.user),
    );
  }

  async createLesson(req, res) {
    return sendSuccess(
      res,
      201,
      "Lesson created successfully",
      await this.service.createLesson(req.params.classId, req.body, req.user),
    );
  }

  async updateLesson(req, res) {
    return sendSuccess(
      res,
      200,
      "Lesson updated successfully",
      await this.service.updateLesson(req.params.lessonId, req.body, req.user),
    );
  }

  async deleteLesson(req, res) {
    return sendSuccess(
      res,
      200,
      "Lesson deleted successfully",
      await this.service.deleteLesson(req.params.lessonId, req.user),
    );
  }
}

export default new LessonsController();
