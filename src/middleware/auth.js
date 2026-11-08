import { UnauthorizedError, ForbiddenError } from "../core/error.response.js";
import authService from "../service/auth.service.js";

export const requireAuth = async (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? "");

  if (!match) {
    return next(new UnauthorizedError("Bearer access token is required"));
  }

  try {
    const user = await authService.authenticateAccessToken(match[1]);

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
