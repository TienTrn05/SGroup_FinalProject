import { EntitySchema } from "typeorm";

export const LessonProgress = new EntitySchema({
  schema: "public",
  name: "LessonProgress",
  tableName: "lesson_progress",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    lesson_id: { type: Number },
    member_id: { type: Number },
    completed_at: { type: "timestamp", createDate: true },
  },
  uniques: [
    { name: "uq_lesson_progress", columns: ["lesson_id", "member_id"] },
  ],
  relations: {
    lesson: {
      type: "many-to-one",
      target: "Lesson",
      joinColumn: { name: "lesson_id" },
      onDelete: "CASCADE",
    },
    member: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "member_id" },
      onDelete: "RESTRICT",
    },
  },
});
