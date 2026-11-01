import * as usersRepository from "../repository/users.repository.js";
import { createUser } from "./users.service.js";
import { verifyPassword } from "../utils/passwordhelper.js";
import { signToken, verifyToken } from "../utils/jwt.helper.js";
import { UnauthorizedError } from "../core/error.response.js";

export const register = (data) => createUser(data);

export const login = async ({ email, password }) => {
  const user = await usersRepository.findByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const { password_hash, ...publicUser } = user;
  return {
    user: publicUser,
    accessToken: signToken(user.id, "access"),
    refreshToken: signToken(user.id, "refresh"),
  };
};

export const getMe = async (userId) => {
  const user = await usersRepository.findById(userId);
  if (!user) throw new UnauthorizedError("Account no longer exists");
  return user;
};

export const refresh = async (refreshToken) => {
  const userId = verifyToken(refreshToken, "refresh");
  await getMe(userId);
  return { accessToken: signToken(userId, "access") };
};
