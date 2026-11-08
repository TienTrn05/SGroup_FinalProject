import defaultClassesRepository from "../repository/classes.repository.js";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../core/error.response.js";

export class ClassAccessService {
  constructor({ classesRepository = defaultClassesRepository } = {}) {
    this.classesRepository = classesRepository;
  }

  requireUser(user) {
    if (!user) throw new UnauthorizedError();
  }

  async #findClass(classId, user) {
    this.requireUser(user);
    const classroom = await this.classesRepository.findById(classId);
    if (!classroom) throw new NotFoundError("Class not found");
    return classroom;
  }

  async requireClassMentor(classId, user) {
    const classroom = await this.#findClass(classId, user);
    if (String(classroom.mentor_id) !== String(user.id)) {
      throw new ForbiddenError(
        "Only the assigned mentor can manage lessons in this class",
      );
    }
    return classroom;
  }

  async requireLessonReader(classId, user) {
    const classroom = await this.#findClass(classId, user);
    if (
      String(classroom.mentor_id) !== String(user.id) &&
      !(
        user.role === "MEMBER" &&
        (await this.classesRepository.isMember(classId, user.id))
      )
    ) {
      throw new ForbiddenError(
        "Only the assigned mentor or an enrolled member can view lessons",
      );
    }
    return classroom;
  }

  async requireEnrolledMember(classId, user) {
    const classroom = await this.#findClass(classId, user);
    if (
      user.role !== "MEMBER" ||
      !(await this.classesRepository.isMember(classId, user.id))
    ) {
      throw new ForbiddenError(
        "Only an enrolled member can access lesson progress",
      );
    }
    return classroom;
  }
}

export default new ClassAccessService();
