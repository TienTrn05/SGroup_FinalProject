import * as usersRepository from "../repository/users.repository.js";
import { ConflictError } from "../core/error.response.js";
import { hashPassword } from "../utils/passwordhelper.js";

// Map the constraints in sgroup_lastest.sql to API errors.
const handleDatabaseError = (error) => {
  if (error.code === "23505" && error.constraint === "users_email_key") {
    throw new ConflictError("Email already exists");
  }
  if (error.code === "23503" || error.code === "23001") {
    throw new ConflictError(
      "User is referenced by other records and cannot be deleted",
    );
  }
  throw error;
};

export const getAllUsers = () => usersRepository.findAll();
export const getUserById = (userId) => usersRepository.findById(userId);

export const createUser = async (userData) => {
  if (await usersRepository.emailExists(userData.email)) {
    throw new ConflictError("Email already exists");
  }
  const passwordHash = await hashPassword(userData.password);
  try {
    return await usersRepository.create({
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      password_hash: passwordHash,
      role: userData.role ?? "MEMBER",
    });
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const updateUser = async (userId, updatedData) => {
  if (!(await usersRepository.findById(userId))) return null;
  if (
    updatedData.email !== undefined &&
    (await usersRepository.emailExists(updatedData.email, userId))
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
    return await usersRepository.update(userId, changes);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const deleteUser = async (userId) => {
  try {
    return await usersRepository.remove(userId);
  } catch (error) {
    handleDatabaseError(error);
  }
};
