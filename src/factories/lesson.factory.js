import { Lesson } from "../entities/lesson.entity.js";
import { BaseFactory } from "./base.factory.js";

export class LessonFactory extends BaseFactory {
  constructor(database) {
    super(Lesson, database, ["class_id", "created_by"]);
  }

  definition(sequence) {
    return {
      title: `Sample lesson ${sequence}`,
      content: "Sample lesson content.",
      order_index: sequence,
    };
  }
}
