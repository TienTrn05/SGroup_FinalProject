import * as classesRepository from "../repository/classes.repository.js";
import * as usersRepository from "../repository/users.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../core/error.response.js";

const requireUser = (user) => {
  if (!user) throw new UnauthorizedError();
};

const requireAdmin = (user) => {
  requireUser(user);
  if (user.role !== "ADMIN")
    throw new ForbiddenError("Only Admin can manage classes");
};

const findClass = async (classId) => {
  const classroom = await classesRepository.findById(classId);
  if (!classroom) throw new NotFoundError("Class not found");
  return classroom;
};

const validateMentor = async (mentorId) => {
  if (
    mentorId !== undefined &&
    mentorId !== null &&
    !(await usersRepository.findById(mentorId))
  ) {
    throw new NotFoundError("Mentor not found");
  }
};

const validateDates = ({ start_date, end_date }) => {
  // Both values are validated YYYY-MM-DD strings or null.
  if (start_date && end_date && start_date > end_date) {
    throw new BadRequestError("start_date must be on or before end_date");
  }
};

const handleDatabaseError = (error) => {
  if (error.code === "23503" && error.constraint === "fk_class_mentor") {
    throw new NotFoundError("Mentor not found");
  }
  if (error.code === "23514" && error.constraint === "chk_classes_date") {
    throw new BadRequestError("start_date must be on or before end_date");
  }
  if (error.code === "23503" || error.code === "23001") {
    throw new ConflictError("Class is referenced by other records");
  }
  throw error;
};

export const getAllClasses = (user) => {
  requireUser(user);
  return classesRepository.findAllForUser(user);
};

export const getClassById = async (classId, user) => {
  requireUser(user);
  const classroom = await findClass(classId);
  const canView =
    user.role === "ADMIN" ||
    String(classroom.mentor_id) === String(user.id) ||
    (await classesRepository.isMember(classId, user.id));
  if (!canView)
    throw new ForbiddenError("You do not have access to this class");
  return classroom;
};

export const createClass = async (data, user) => {
  requireAdmin(user);
  validateDates(data);
  await validateMentor(data.mentor_id);
  try {
    return await classesRepository.create(data);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const updateClass = async (classId, changes, user) => {
  requireAdmin(user);
  const classroom = await findClass(classId);
  // PATCH must compare a changed date with the other date already stored in DB.
  validateDates({ ...classroom, ...changes });
  await validateMentor(changes.mentor_id);
  try {
    const updated = await classesRepository.update(classId, changes);
    if (!updated) throw new NotFoundError("Class not found");
    return updated;
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const deleteClass = async (classId, user) => {
  requireAdmin(user);
  try {
    const deleted = await classesRepository.remove(classId);
    if (!deleted) throw new NotFoundError("Class not found");
    return deleted;
  } catch (error) {
    handleDatabaseError(error);
  }
};
