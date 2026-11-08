import { ClassMember } from "../entities/classMember.entity.js";
import { BaseRepository } from "./base.repository.js";

export class ClassMembersRepository extends BaseRepository {
  constructor(database) {
    super(ClassMember, database);
  }

  async findByClassId(classId) {
    const memberships = await this.repository.find({
      where: { class_id: classId },
      relations: { member: true },
      select: {
        id: true,
        class_id: true,
        member_id: true,
        joined_at: true,
        member: { id: true, name: true, email: true, role: true },
      },
      order: { id: "ASC" },
    });
    return memberships.map(({ member, ...membership }) => ({
      ...membership,
      name: member.name,
      email: member.email,
      role: member.role,
    }));
  }

  async create(classId, memberId) {
    return (
      await this.insertRows({ class_id: classId, member_id: memberId })
    )[0];
  }

  remove(classId, memberId) {
    return this.deleteRow({ class_id: classId, member_id: memberId });
  }
}

export default new ClassMembersRepository();
