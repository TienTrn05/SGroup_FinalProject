import defaultClassesService from "../service/classes.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export class ClassesController {
  constructor(service = defaultClassesService) {
    this.service = service;
    this.getAllClasses = catchAsync(this.getAllClasses.bind(this));
    this.getClassById = catchAsync(this.getClassById.bind(this));
    this.createClass = catchAsync(this.createClass.bind(this));
    this.updateClass = catchAsync(this.updateClass.bind(this));
    this.deleteClass = catchAsync(this.deleteClass.bind(this));
  }

  async getAllClasses(req, res) {
    const classes = await this.service.getAllClasses(req.user);
    return sendSuccess(res, 200, "Classes retrieved successfully", classes);
  }

  async getClassById(req, res) {
    const classroom = await this.service.getClassById(
      req.params.classId,
      req.user,
    );
    return sendSuccess(res, 200, "Class retrieved successfully", classroom);
  }

  async createClass(req, res) {
    const classroom = await this.service.createClass(req.body, req.user);
    return sendSuccess(res, 201, "Class created successfully", classroom);
  }

  async updateClass(req, res) {
    const classroom = await this.service.updateClass(
      req.params.classId,
      req.body,
      req.user,
    );
    return sendSuccess(res, 200, "Class updated successfully", classroom);
  }

  async deleteClass(req, res) {
    const classroom = await this.service.deleteClass(
      req.params.classId,
      req.user,
    );
    return sendSuccess(res, 200, "Class deleted successfully", classroom);
  }
}

export default new ClassesController();
