import defaultUsersService from "../service/users.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import { NotFoundError } from "../core/error.response.js";

export class UsersController {
  constructor(service = defaultUsersService) {
    this.service = service;
    this.getAllUsers = catchAsync(this.getAllUsers.bind(this));
    this.getUserById = catchAsync(this.getUserById.bind(this));
    this.createUser = catchAsync(this.createUser.bind(this));
    this.updateUser = catchAsync(this.updateUser.bind(this));
    this.deleteUser = catchAsync(this.deleteUser.bind(this));
  }

  async getAllUsers(req, res) {
    const users = await this.service.getAllUsers();
    return sendSuccess(res, 200, "Users retrieved successfully", users);
  }

  async getUserById(req, res) {
    const user = await this.service.getUserById(req.params.id);

    if (!user) throw new NotFoundError("User not found");

    return sendSuccess(res, 200, "User retrieved successfully", user);
  }

  async createUser(req, res) {
    const newUser = await this.service.createUser(req.body);
    return sendSuccess(res, 201, "User created successfully", newUser);
  }

  async updateUser(req, res) {
    const updatedUser = await this.service.updateUser(req.params.id, req.body);

    if (!updatedUser) throw new NotFoundError("User not found");

    return sendSuccess(res, 200, "User updated successfully", updatedUser);
  }

  async deleteUser(req, res) {
    const deletedUser = await this.service.deleteUser(req.params.id);

    if (!deletedUser) throw new NotFoundError("User not found");

    return sendSuccess(res, 200, "User deleted successfully", deletedUser);
  }
}

export default new UsersController();
