import defaultClassesRepository from "../repository/classes.repository.js";
import defaultUsersRepository from "../repository/users.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../core/error.response.js";

export class ClassesService {
  constructor({
    classesRepository = defaultClassesRepository,
    usersRepository = defaultUsersRepository,
  } = {}) {
    this.classesRepository = classesRepository;
    this.usersRepository = usersRepository;
  }

  #requireUser(user) {
    if (!user) throw new UnauthorizedError();
  }

  #requireAdmin(user) {
    this.#requireUser(user);
    if (user.role !== "ADMIN")
      throw new ForbiddenError("Only Admin can manage classes");
  }

  async #findClass(classId) {
    const classroom = await this.classesRepository.findById(classId);
    if (!classroom) throw new NotFoundError("Class not found");
    return classroom;
  }

  async #validateMentor(mentorId) {
    if (
      mentorId !== undefined &&
      mentorId !== null &&
      !(await this.usersRepository.findById(mentorId))
    ) {
      throw new NotFoundError("Mentor not found");
    }
  }

  #validateDates({ start_date, end_date }) {
    // Both values are validated YYYY-MM-DD strings or null.
    if (start_date && end_date && start_date > end_date) {
      throw new BadRequestError("start_date must be on or before end_date");
    }
  }

  #handleDatabaseError(error) {
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
  }

  getAllClasses(user) {
    this.#requireUser(user);
    return this.classesRepository.findAllForUser(user);
  }

  async getClassById(classId, user) {
    this.#requireUser(user);
    const classroom = await this.#findClass(classId);
    const canView =
      user.role === "ADMIN" ||
      String(classroom.mentor_id) === String(user.id) ||
      (await this.classesRepository.isMember(classId, user.id));
    if (!canView)
      throw new ForbiddenError("You do not have access to this class");
    return classroom;
  }

  async createClass(data, user) {
    this.#requireAdmin(user);
    this.#validateDates(data);
    await this.#validateMentor(data.mentor_id);
    try {
      return await this.classesRepository.create(data);
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async updateClass(classId, changes, user) {
    this.#requireAdmin(user);
    const classroom = await this.#findClass(classId);
    // PATCH must compare a changed date with the other date already stored in DB.
    this.#validateDates({ ...classroom, ...changes });
    await this.#validateMentor(changes.mentor_id);
    try {
      const updated = await this.classesRepository.update(classId, changes);
      if (!updated) throw new NotFoundError("Class not found");
      return updated;
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async deleteClass(classId, user) {
    this.#requireAdmin(user);
    try {
      const deleted = await this.classesRepository.remove(classId);
      if (!deleted) throw new NotFoundError("Class not found");
      return deleted;
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }
}

export default new ClassesService();
