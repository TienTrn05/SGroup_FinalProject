import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  schema: "public",
  name: "User",
  tableName: "users",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    name: { type: String, length: 100 },
    email: { type: String, length: 255, unique: true },
    password_hash: { type: String, length: 255, select: false },
    role: {
      type: "enum",
      enumName: "user_role",
      enum: ["ADMIN", "MEMBER"],
      default: "MEMBER",
    },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
});
