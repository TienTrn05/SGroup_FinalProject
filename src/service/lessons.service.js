import defaultLessonsRepository from "../repository/lessons.repository.js";
import defaultClassAccessService from "./classAccess.service.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../core/error.response.js";

export class LessonsService {
  constructor({
    lessonsRepository = defaultLessonsRepository,
    classAccessService = defaultClassAccessService,
  } = {}) {
    this.lessonsRepository = lessonsRepository;
    this.classAccessService = classAccessService;
  }

  async #findLesson(lessonId, user) {
    this.classAccessService.requireUser(user);
    const lesson = await this.lessonsRepository.findById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found");
    return lesson;
  }

  #handleDatabaseError(error) {
    if (error.code === "23505" && error.constraint === "uq_lesson_order") {
      throw new ConflictError("order_index already exists in this class");
    }
    if (error.code === "23503" && error.constraint === "fk_lesson_class") {
      throw new NotFoundError("Class not found");
    }
    if (error.code === "23503" && error.constraint === "fk_lesson_creator") {
      throw new NotFoundError("Mentor account not found");
    }
    if (error.code === "23503" || error.code === "23001") {
      throw new ConflictError("Lesson is referenced by other records");
    }
    throw error;
  }

  async getClassLessons(classId, user) {
    await this.classAccessService.requireLessonReader(classId, user);
    return this.lessonsRepository.findByClassId(classId);
  }

  async getLessonById(lessonId, user) {
    const lesson = await this.#findLesson(lessonId, user);
    await this.classAccessService.requireLessonReader(lesson.class_id, user);
    return lesson;
  }

  async createLesson(classId, data, user) {
    await this.classAccessService.requireClassMentor(classId, user);
    try {
      return await this.lessonsRepository.create(classId, data, user.id);
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async updateLesson(lessonId, changes, user) {
    const lesson = await this.#findLesson(lessonId, user);
    await this.classAccessService.requireClassMentor(lesson.class_id, user);
    if (
      !["title", "content", "order_index"].some(
        (field) => changes[field] !== undefined,
      )
    ) {
      throw new BadRequestError("At least one lesson field is required");
    }
    try {
      const updated = await this.lessonsRepository.update(lessonId, changes);
      if (!updated) throw new NotFoundError("Lesson not found");
      return updated;
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async deleteLesson(lessonId, user) {
    const lesson = await this.#findLesson(lessonId, user);
    await this.classAccessService.requireClassMentor(lesson.class_id, user);
    try {
      // Existing FK fk_progress_lesson cascades deletion to this lesson's progress.
      const deleted = await this.lessonsRepository.remove(lessonId);
      if (!deleted) throw new NotFoundError("Lesson not found");
      return deleted;
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }
}

export default new LessonsService();
