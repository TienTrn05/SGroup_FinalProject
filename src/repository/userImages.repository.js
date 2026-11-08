import { UserImage } from "../entities/userImage.entity.js";
import { BaseRepository } from "./base.repository.js";

export class UserImagesRepository extends BaseRepository {
  constructor(database) {
    super(UserImage, database);
  }

  createMany(userId, imageUrls) {
    return this.insertRows(
      imageUrls.map((image_url) => ({ user_id: userId, image_url })),
    );
  }

  findByIdAndUserId(imageId, userId) {
    return this.repository.findOneBy({ id: imageId, user_id: userId });
  }

  removeByIdAndUserId(imageId, userId) {
    return this.deleteRow({ id: imageId, user_id: userId });
  }
}

export default new UserImagesRepository();
