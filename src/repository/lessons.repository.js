import { Lesson } from "../entities/lesson.entity.js";
import { BaseRepository } from "./base.repository.js";

export class LessonsRepository extends BaseRepository {
  constructor(database) {
    super(Lesson, database);
  }

  findByClassId(classId) {
    return this.repository.find({
      where: { class_id: classId },
      order: { order_index: "ASC", id: "ASC" },
    });
  }

  findById(id) {
    return this.repository.findOneBy({ id });
  }

  async create(classId, { title, content = null, order_index }, creatorId) {
    return (
      await this.insertRows({
        class_id: classId,
        title,
        content,
        order_index,
        created_by: creatorId,
      })
    )[0];
  }

  update(id, changes) {
    return this.updateRow(id, changes, ["title", "content", "order_index"]);
  }

  remove(id) {
    return this.deleteRow({ id });
  }
}

export default new LessonsRepository();
