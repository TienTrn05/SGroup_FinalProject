import { randomUUID } from "node:crypto";
import { UserImage } from "../entities/userImage.entity.js";
import { BaseFactory } from "./base.factory.js";

export class UserImageFactory extends BaseFactory {
  constructor(database) {
    super(UserImage, database, ["user_id"]);
  }

  definition() {
    return { image_url: `https://example.com/images/${randomUUID()}.png` };
  }
}
