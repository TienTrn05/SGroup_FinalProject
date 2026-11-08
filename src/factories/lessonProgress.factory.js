import { LessonProgress } from "../entities/lessonProgress.entity.js";
import { BaseFactory } from "./base.factory.js";

export class LessonProgressFactory extends BaseFactory {
  constructor(database) {
    super(LessonProgress, database, ["lesson_id", "member_id"]);
  }
}
