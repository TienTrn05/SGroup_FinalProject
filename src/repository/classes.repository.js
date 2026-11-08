import { Class } from "../entities/class.entity.js";
import { BaseRepository } from "./base.repository.js";

export class ClassesRepository extends BaseRepository {
  constructor(database) {
    super(Class, database);
  }

  findAllForUser(user) {
    return this.repository.find({
      ...(user.role === "ADMIN"
        ? {}
        : {
            where: [
              { mentor_id: user.id },
              { members: { member_id: user.id } },
            ],
          }),
      order: { id: "ASC" },
    });
  }

  findById(id) {
    return this.repository.findOneBy({ id });
  }

  isMember(classId, userId) {
    return this.database
      .getRepository("ClassMember")
      .existsBy({ class_id: classId, member_id: userId });
  }

  async create({
    name,
    description = null,
    start_date = null,
    end_date = null,
    mentor_id = null,
  }) {
    return (
      await this.insertRows({
        name,
        description,
        start_date,
        end_date,
        mentor_id,
      })
    )[0];
  }

  update(id, changes) {
    return this.updateRow(id, changes, [
      "name",
      "description",
      "start_date",
      "end_date",
      "mentor_id",
    ]);
  }

  remove(id) {
    return this.deleteRow({ id });
  }
}

export default new ClassesRepository();
