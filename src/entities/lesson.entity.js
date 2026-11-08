import { EntitySchema } from "typeorm";

export const Lesson = new EntitySchema({
  schema: "public",
  name: "Lesson",
  tableName: "lessons",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    class_id: { type: Number },
    title: { type: String, length: 255 },
    content: { type: "text", nullable: true },
    order_index: { type: Number },
    created_by: { type: Number },
  },
  uniques: [{ name: "uq_lesson_order", columns: ["class_id", "order_index"] }],
  relations: {
    class: {
      type: "many-to-one",
      target: "Class",
      joinColumn: { name: "class_id" },
      onDelete: "CASCADE",
    },
    creator: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "created_by" },
      onDelete: "RESTRICT",
    },
    progress: {
      type: "one-to-many",
      target: "LessonProgress",
      inverseSide: "lesson",
    },
  },
});
