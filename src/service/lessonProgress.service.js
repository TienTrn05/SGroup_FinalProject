import defaultLessonsRepository from "../repository/lessons.repository.js";
import defaultProgressRepository from "../repository/lessonProgress.repository.js";
import defaultClassAccessService from "./classAccess.service.js";
import { NotFoundError } from "../core/error.response.js";

export class LessonProgressService {
  constructor({
    lessonsRepository = defaultLessonsRepository,
    progressRepository = defaultProgressRepository,
    classAccessService = defaultClassAccessService,
  } = {}) {
    this.lessonsRepository = lessonsRepository;
    this.progressRepository = progressRepository;
    this.classAccessService = classAccessService;
  }

  async completeLesson(lessonId, user) {
    this.classAccessService.requireUser(user);
    const lesson = await this.lessonsRepository.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found");
    await this.classAccessService.requireEnrolledMember(lesson.class_id, user);
    try {
      return await this.progressRepository.complete(lessonId, user.id);
    } catch (error) {
      if (error.code === "23503" && error.constraint === "fk_progress_lesson") {
        throw new NotFoundError("Lesson not found");
      }
      if (error.code === "23503" && error.constraint === "fk_progress_member") {
        throw new NotFoundError("Member account not found");
      }
      throw error;
    }
  }

  async getClassProgress(classId, user) {
    await this.classAccessService.requireEnrolledMember(classId, user);
    const { total, completed } = await this.progressRepository.getClassProgress(
      classId,
      user.id,
    );
    return {
      totalLessons: total,
      completedLessons: completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 10000) / 100,
    };
  }
}

export default new LessonProgressService();
