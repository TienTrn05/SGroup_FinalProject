import defaultClassMembersRepository from "../repository/classMembers.repository.js";
import defaultClassesRepository from "../repository/classes.repository.js";
import defaultUsersRepository from "../repository/users.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../core/error.response.js";

export class ClassMembersService {
  constructor({
    classMembersRepository = defaultClassMembersRepository,
    classesRepository = defaultClassesRepository,
    usersRepository = defaultUsersRepository,
  } = {}) {
    this.classMembersRepository = classMembersRepository;
    this.classesRepository = classesRepository;
    this.usersRepository = usersRepository;
  }

  #requireUser(user) {
    if (!user) throw new UnauthorizedError();
  }

  #requireAdmin(user) {
    this.#requireUser(user);
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only Admin can manage class members");
    }
  }

  async #findClass(classId) {
    const classroom = await this.classesRepository.findById(classId);
    if (!classroom) throw new NotFoundError("Class not found");
    return classroom;
  }

  #handleDatabaseError(error) {
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
  }

  async getClassMembers(classId, user) {
    this.#requireUser(user);
    const classroom = await this.#findClass(classId);
    if (
      user.role !== "ADMIN" &&
      String(classroom.mentor_id) !== String(user.id)
    ) {
      throw new ForbiddenError(
        "Only Admin or the assigned mentor can view class members",
      );
    }
    return this.classMembersRepository.findByClassId(classId);
  }

  async addClassMember(classId, memberId, user) {
    this.#requireAdmin(user);
    await this.#findClass(classId);
    const member = await this.usersRepository.findById(memberId);
    if (!member) throw new NotFoundError("Member not found");
    if (member.role !== "MEMBER") {
      throw new BadRequestError(
        "Only users with role MEMBER can be added to a class",
      );
    }
    try {
      // The DB unique constraint also handles concurrent requests for the same pair.
      return await this.classMembersRepository.create(classId, memberId);
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async removeClassMember(classId, memberId, user) {
    this.#requireAdmin(user);
    await this.#findClass(classId);
    try {
      // Remove enrollment only; submissions and progress remain in the database.
      const deleted = await this.classMembersRepository.remove(classId, memberId);
      if (!deleted) throw new NotFoundError("Class member not found");
      return deleted;
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }
}

export default new ClassMembersService();
