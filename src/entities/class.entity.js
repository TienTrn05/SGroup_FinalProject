import { EntitySchema } from "typeorm";

export const Class = new EntitySchema({
  schema: "public",
  name: "Class",
  tableName: "classes",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    name: { type: String, length: 255 },
    description: { type: "text", nullable: true },
    start_date: { type: "date", nullable: true },
    end_date: { type: "date", nullable: true },
    mentor_id: { type: Number, nullable: true },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  relations: {
    mentor: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "mentor_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
    members: {
      type: "one-to-many",
      target: "ClassMember",
      inverseSide: "class",
    },
    lessons: { type: "one-to-many", target: "Lesson", inverseSide: "class" },
    assignments: {
      type: "one-to-many",
      target: "Assignment",
      inverseSide: "class",
    },
  },
});
