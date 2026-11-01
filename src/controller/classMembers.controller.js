import * as classMembersService from "../service/classMembers.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getClassMembers = catchAsync(async (req, res) => {
  const members = await classMembersService.getClassMembers(
    req.params.classId,
    req.user,
  );
  return sendSuccess(res, 200, "Class members retrieved successfully", members);
});

export const addClassMember = catchAsync(async (req, res) => {
  const member = await classMembersService.addClassMember(
    req.params.classId,
    req.body.memberId,
    req.user,
  );
  return sendSuccess(res, 201, "Member added to class successfully", member);
});

export const removeClassMember = catchAsync(async (req, res) => {
  const member = await classMembersService.removeClassMember(
    req.params.classId,
    req.params.memberId,
    req.user,
  );
  return sendSuccess(
    res,
    200,
    "Member removed from class successfully",
    member,
  );
});
