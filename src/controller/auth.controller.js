import * as authService from "../service/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  return sendSuccess(res, 201, "User registered successfully", user);
});

export const login = catchAsync(async (req, res) => {
  const data = await authService.login(req.body);
  return sendSuccess(res, 200, "Login successful", data);
});

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.userId);
  return sendSuccess(res, 200, "Current user retrieved successfully", user);
});

export const refresh = catchAsync(async (req, res) => {
  const data = await authService.refresh(req.body.refreshToken);
  return sendSuccess(res, 200, "Access token refreshed successfully", data);
});
