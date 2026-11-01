import * as classesService from "../service/classes.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getAllClasses = catchAsync(async (req, res) => {
  const classes = await classesService.getAllClasses(req.user);
  return sendSuccess(res, 200, "Classes retrieved successfully", classes);
});

export const getClassById = catchAsync(async (req, res) => {
  const classroom = await classesService.getClassById(
    req.params.classId,
    req.user,
  );
  return sendSuccess(res, 200, "Class retrieved successfully", classroom);
});

export const createClass = catchAsync(async (req, res) => {
  const classroom = await classesService.createClass(req.body, req.user);
  return sendSuccess(res, 201, "Class created successfully", classroom);
});

export const updateClass = catchAsync(async (req, res) => {
  const classroom = await classesService.updateClass(
    req.params.classId,
    req.body,
    req.user,
  );
  return sendSuccess(res, 200, "Class updated successfully", classroom);
});

export const deleteClass = catchAsync(async (req, res) => {
  const classroom = await classesService.deleteClass(
    req.params.classId,
    req.user,
  );
  return sendSuccess(res, 200, "Class deleted successfully", classroom);
});
