import { EntitySchema } from "typeorm";

export const AuthSession = new EntitySchema({
  schema: "public",
  name: "AuthSession",
  tableName: "auth_sessions",
  columns: {
    id: { type: "uuid", primary: true },
    user_id: { type: Number },
    expires_at: { type: "timestamptz" },
    revoked_at: { type: "timestamptz", nullable: true },
    created_at: { type: "timestamptz", createDate: true, select: false },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
    },
  },
});
