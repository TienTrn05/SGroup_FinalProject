import * as classMembersRepository from "../repository/classMembers.repository.js";
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
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Only Admin can manage class members");
  }
};

const findClass = async (classId) => {
  const classroom = await classesRepository.findById(classId);
  if (!classroom) throw new NotFoundError("Class not found");
  return classroom;
};

const handleDatabaseError = (error) => {
  if (error.code === "23505" && error.constraint === "uq_class_member") {
    throw new ConflictError("Member already belongs to this class");
  }
  if (error.code === "23503" && error.constraint === "fk_class_member_class") {
    throw new NotFoundError("Class not found");
  }
  if (error.code === "23503" && error.constraint === "fk_class_member_user") {
    throw new NotFoundError("Member not found");
  }
  if (error.code === "23503" || error.code === "23001") {
    throw new ConflictError("Class membership is referenced by other records");
  }
  throw error;
};

export const getClassMembers = async (classId, user) => {
  requireUser(user);
  const classroom = await findClass(classId);
  if (
    user.role !== "ADMIN" &&
    String(classroom.mentor_id) !== String(user.id)
  ) {
    throw new ForbiddenError(
      "Only Admin or the assigned mentor can view class members",
    );
  }
  return classMembersRepository.findByClassId(classId);
};

export const addClassMember = async (classId, memberId, user) => {
  requireAdmin(user);
  await findClass(classId);
  const member = await usersRepository.findById(memberId);
  if (!member) throw new NotFoundError("Member not found");
  if (member.role !== "MEMBER") {
    throw new BadRequestError(
      "Only users with role MEMBER can be added to a class",
    );
  }
  try {
    // The DB unique constraint also handles concurrent requests for the same pair.
    return await classMembersRepository.create(classId, memberId);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const removeClassMember = async (classId, memberId, user) => {
  requireAdmin(user);
  await findClass(classId);
  try {
    // Remove enrollment only; submissions and progress remain in the database.
    const deleted = await classMembersRepository.remove(classId, memberId);
    if (!deleted) throw new NotFoundError("Class member not found");
    return deleted;
  } catch (error) {
    handleDatabaseError(error);
  }
};
