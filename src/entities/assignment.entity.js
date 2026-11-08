import { EntitySchema } from "typeorm";

export const Assignment = new EntitySchema({
  schema: "public",
  name: "Assignment",
  tableName: "assignments",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    class_id: { type: Number },
    title: { type: String, length: 255 },
    description: { type: "text", nullable: true },
    deadline: { type: "timestamp", nullable: true },
    maximum_score: { type: "numeric", precision: 5, scale: 2 },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  relations: {
    class: {
      type: "many-to-one",
      target: "Class",
      joinColumn: { name: "class_id" },
      onDelete: "CASCADE",
    },
    submissions: {
      type: "one-to-many",
      target: "Submission",
      inverseSide: "assignment",
    },
  },
});
