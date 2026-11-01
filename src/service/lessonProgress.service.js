import * as lessonsRepository from "../repository/lessons.repository.js";
import * as progressRepository from "../repository/lessonProgress.repository.js";
import { requireUser, requireEnrolledMember } from "./classAccess.service.js";
import { NotFoundError } from "../core/error.response.js";

export const completeLesson = async (lessonId, user) => {
  requireUser(user);
  const lesson = await lessonsRepository.findById(lessonId);
  if (!lesson) throw new NotFoundError("Lesson not found");
  await requireEnrolledMember(lesson.class_id, user);
  try {
    return await progressRepository.complete(lessonId, user.id);
  } catch (error) {
    if (error.code === "23503" && error.constraint === "fk_progress_lesson") {
      throw new NotFoundError("Lesson not found");
    }
    if (error.code === "23503" && error.constraint === "fk_progress_member") {
      throw new NotFoundError("Member account not found");
    }
    throw error;
  }
};

export const getClassProgress = async (classId, user) => {
  await requireEnrolledMember(classId, user);
  const { total, completed } = await progressRepository.getClassProgress(
    classId,
    user.id,
  );
  return {
    totalLessons: total,
    completedLessons: completed,
    progress: total === 0 ? 0 : Math.round((completed / total) * 10000) / 100,
  };
};
