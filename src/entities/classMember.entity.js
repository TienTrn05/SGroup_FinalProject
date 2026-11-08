import { EntitySchema } from "typeorm";

export const ClassMember = new EntitySchema({
  schema: "public",
  name: "ClassMember",
  tableName: "class_members",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    class_id: { type: Number },
    member_id: { type: Number },
    joined_at: { type: "timestamp", createDate: true },
  },
  uniques: [{ name: "uq_class_member", columns: ["class_id", "member_id"] }],
  relations: {
    class: {
      type: "many-to-one",
      target: "Class",
      joinColumn: { name: "class_id" },
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
