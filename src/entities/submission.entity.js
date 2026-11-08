import { EntitySchema } from "typeorm";

export const Submission = new EntitySchema({
  schema: "public",
  name: "Submission",
  tableName: "submissions",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    assignment_id: { type: Number },
    member_id: { type: Number },
    content: { type: "text", nullable: true },
    repository_url: { type: String, length: 500, nullable: true },
    submitted_at: { type: "timestamp", createDate: true },
    score: { type: "numeric", precision: 5, scale: 2, nullable: true },
    feedback: { type: "text", nullable: true },
    reviewed_at: { type: "timestamp", nullable: true },
    reviewed_by: { type: Number, nullable: true },
  },
  uniques: [
    { name: "uq_submission", columns: ["assignment_id", "member_id"] },
  ],
  relations: {
    assignment: {
      type: "many-to-one",
      target: "Assignment",
      joinColumn: { name: "assignment_id" },
      onDelete: "CASCADE",
    },
    member: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "member_id" },
      onDelete: "RESTRICT",
    },
    reviewer: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "reviewed_by" },
      nullable: true,
      onDelete: "SET NULL",
    },
  },
});
