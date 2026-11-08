import { EntitySchema } from "typeorm";

export const UserImage = new EntitySchema({
  schema: "public",
  name: "UserImage",
  tableName: "user_images",
  columns: {
    id: { type: Number, primary: true, generated: "increment" },
    user_id: { type: Number },
    image_url: { type: "text" },
    created_at: { type: "timestamp", createDate: true, nullable: true },
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
