import defaultAuthService from "../service/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export class AuthController {
  constructor(service = defaultAuthService) {
    this.service = service;
    this.register = catchAsync(this.register.bind(this));
    this.login = catchAsync(this.login.bind(this));
    this.getMe = catchAsync(this.getMe.bind(this));
    this.refresh = catchAsync(this.refresh.bind(this));
    this.logout = catchAsync(this.logout.bind(this));
  }

  async register(req, res) {
    const user = await this.service.register(req.body);
    return sendSuccess(res, 201, "User registered successfully", user);
  }

  async login(req, res) {
    const data = await this.service.login(req.body);
    return sendSuccess(res, 200, "Login successful", data);
  }

  async getMe(req, res) {
    const user = await this.service.getMe(req.userId);
    return sendSuccess(res, 200, "Current user retrieved successfully", user);
  }

  async refresh(req, res) {
    const data = await this.service.refresh(req.body.refreshToken);
    return sendSuccess(res, 200, "Access token refreshed successfully", data);
  }

  async logout(req, res) {
    await this.service.logout(req.body.refreshToken);
    return sendSuccess(res, 200, "Logout successful");
  }
}

export default new AuthController();
