import defaultClassMembersService from "../service/classMembers.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export class ClassMembersController {
  constructor(service = defaultClassMembersService) {
    this.service = service;
    this.getClassMembers = catchAsync(this.getClassMembers.bind(this));
    this.addClassMember = catchAsync(this.addClassMember.bind(this));
    this.removeClassMember = catchAsync(this.removeClassMember.bind(this));
  }

  async getClassMembers(req, res) {
    const members = await this.service.getClassMembers(
      req.params.classId,
      req.user,
    );
    return sendSuccess(res, 200, "Class members retrieved successfully", members);
  }

  async addClassMember(req, res) {
    const member = await this.service.addClassMember(
      req.params.classId,
      req.body.memberId,
      req.user,
    );
    return sendSuccess(res, 201, "Member added to class successfully", member);
  }

  async removeClassMember(req, res) {
    const member = await this.service.removeClassMember(
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
  }
}

export default new ClassMembersController();
