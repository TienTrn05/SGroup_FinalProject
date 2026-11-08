import { ClassMember } from "../entities/classMember.entity.js";
import { BaseFactory } from "./base.factory.js";

export class ClassMemberFactory extends BaseFactory {
  constructor(database) {
    super(ClassMember, database, ["class_id", "member_id"]);
  }
}
