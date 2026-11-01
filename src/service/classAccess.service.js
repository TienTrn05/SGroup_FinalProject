import * as classesRepository from "../repository/classes.repository.js";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../core/error.response.js";

export const requireUser = (user) => {
  if (!user) throw new UnauthorizedError();
};

const findClass = async (classId, user) => {
  requireUser(user);
  const classroom = await classesRepository.findById(classId);
  if (!classroom) throw new NotFoundError("Class not found");
  return classroom;
};

export const requireClassMentor = async (classId, user) => {
  const classroom = await findClass(classId, user);
  if (String(classroom.mentor_id) !== String(user.id)) {
    throw new ForbiddenError(
      "Only the assigned mentor can manage lessons in this class",
    );
  }
  return classroom;
};

export const requireLessonReader = async (classId, user) => {
  const classroom = await findClass(classId, user);
  if (
    String(classroom.mentor_id) !== String(user.id) &&
    !(
      user.role === "MEMBER" &&
      (await classesRepository.isMember(classId, user.id))
    )
  ) {
    throw new ForbiddenError(
      "Only the assigned mentor or an enrolled member can view lessons",
    );
  }
  return classroom;
};

export const requireEnrolledMember = async (classId, user) => {
  const classroom = await findClass(classId, user);
  if (
    user.role !== "MEMBER" ||
    !(await classesRepository.isMember(classId, user.id))
  ) {
    throw new ForbiddenError(
      "Only an enrolled member can access lesson progress",
    );
  }
  return classroom;
};
