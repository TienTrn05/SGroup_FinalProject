import { LessonProgress } from "../entities/lessonProgress.entity.js";
import { BaseRepository } from "./base.repository.js";

export class LessonProgressRepository extends BaseRepository {
  constructor(database) {
    super(LessonProgress, database);
  }

  async complete(lessonId, memberId) {
    const result = await this.repository
      .createQueryBuilder()
      .insert()
      .values({ lesson_id: lessonId, member_id: memberId })
      .orUpdate(["member_id"], ["lesson_id", "member_id"])
      .returning(this.returningColumns)
      .execute();
    return this.returningRows(result)[0];
  }

  async getClassProgress(classId, memberId) {
    // A single aggregate keeps both counts on the same database snapshot.
    const result = await this.database
      .getRepository("Lesson")
      .createQueryBuilder("lesson")
      .leftJoin(
        "lesson.progress",
        "progress",
        "progress.member_id = :memberId",
        { memberId },
      )
      .select("COUNT(lesson.id)", "total")
      .addSelect("COUNT(progress.id)", "completed")
      .where({ class_id: classId })
      .getRawOne();
    return { total: Number(result.total), completed: Number(result.completed) };
  }
}

export default new LessonProgressRepository();
