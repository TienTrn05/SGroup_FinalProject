import * as lessonsRepository from "../repository/lessons.repository.js";
import {
  requireUser,
  requireClassMentor,
  requireLessonReader,
} from "./classAccess.service.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../core/error.response.js";

const findLesson = async (lessonId, user) => {
  requireUser(user);
  const lesson = await lessonsRepository.findById(lessonId);
  if (!lesson) throw new NotFoundError("Lesson not found");
  return lesson;
};

const handleDatabaseError = (error) => {
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
};

export const getClassLessons = async (classId, user) => {
  await requireLessonReader(classId, user);
  return lessonsRepository.findByClassId(classId);
};

export const getLessonById = async (lessonId, user) => {
  const lesson = await findLesson(lessonId, user);
  await requireLessonReader(lesson.class_id, user);
  return lesson;
};

export const createLesson = async (classId, data, user) => {
  await requireClassMentor(classId, user);
  try {
    return await lessonsRepository.create(classId, data, user.id);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const updateLesson = async (lessonId, changes, user) => {
  const lesson = await findLesson(lessonId, user);
  await requireClassMentor(lesson.class_id, user);
  if (
    !["title", "content", "order_index"].some(
      (field) => changes[field] !== undefined,
    )
  ) {
    throw new BadRequestError("At least one lesson field is required");
  }
  try {
    const updated = await lessonsRepository.update(lessonId, changes);
    if (!updated) throw new NotFoundError("Lesson not found");
    return updated;
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const deleteLesson = async (lessonId, user) => {
  const lesson = await findLesson(lessonId, user);
  await requireClassMentor(lesson.class_id, user);
  try {
    // Existing FK fk_progress_lesson cascades deletion to this lesson's progress.
    const deleted = await lessonsRepository.remove(lessonId);
    if (!deleted) throw new NotFoundError("Lesson not found");
    return deleted;
  } catch (error) {
    handleDatabaseError(error);
  }
};
