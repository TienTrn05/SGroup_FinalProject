import { UnauthorizedError, ForbiddenError } from "../core/error.response.js";
import { verifyToken } from "../utils/jwt.helper.js";
import * as usersRepository from "../repository/users.repository.js";

export const requireAuth = async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? "");

  if (!match) {
    return next(new UnauthorizedError("Bearer access token is required"));
  }

  try {
    const userId = verifyToken(match[1], "access");
    const user = await usersRepository.findById(userId);

    if (!user) {
      return next(new UnauthorizedError("Account no longer exists"));
    }

    req.userId = user.id;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  if (req.user.role !== role) {
    return next(new ForbiddenError("You do not have permission"));
  }

  return next();
};
