import defaultUsersRepository from "../repository/users.repository.js";
import { ConflictError } from "../core/error.response.js";
import { hashPassword } from "../utils/passwordhelper.js";

export class UsersService {
  constructor({ usersRepository = defaultUsersRepository } = {}) {
    this.usersRepository = usersRepository;
  }

  // Map the constraints in sgroup_lastest.sql to API errors.
  #handleDatabaseError(error) {
    if (error.code === "23505" && error.constraint === "users_email_key") {
      throw new ConflictError("Email already exists");
    }
    if (error.code === "23503" || error.code === "23001") {
      throw new ConflictError(
        "User is referenced by other records and cannot be deleted",
      );
    }
    throw error;
  }

  getAllUsers() {
    return this.usersRepository.findAll();
  }

  getUserById(userId) {
    return this.usersRepository.findById(userId);
  }

  async createUser(userData) {
    if (await this.usersRepository.emailExists(userData.email)) {
      throw new ConflictError("Email already exists");
    }
    const passwordHash = await hashPassword(userData.password);
    try {
      return await this.usersRepository.create({
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password_hash: passwordHash,
        role: userData.role ?? "MEMBER",
      });
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async updateUser(userId, updatedData) {
    if (!(await this.usersRepository.findById(userId))) return null;
    if (
      updatedData.email !== undefined &&
      (await this.usersRepository.emailExists(updatedData.email, userId))
    ) {
      throw new ConflictError("Email already exists");
    }
    const changes = {};
    if (updatedData.name !== undefined) changes.name = updatedData.name;
    if (updatedData.email !== undefined)
      changes.email = updatedData.email.trim().toLowerCase();
    if (updatedData.role !== undefined) changes.role = updatedData.role;
    if (updatedData.password !== undefined)
      changes.password_hash = await hashPassword(updatedData.password);
    try {
      return await this.usersRepository.update(userId, changes);
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }

  async deleteUser(userId) {
    try {
      return await this.usersRepository.remove(userId);
    } catch (error) {
      this.#handleDatabaseError(error);
    }
  }
}

export default new UsersService();
