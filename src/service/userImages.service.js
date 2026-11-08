import { BadGatewayError, NotFoundError } from "../core/error.response.js";
import defaultUserImagesRepository from "../repository/userImages.repository.js";
import defaultUsersRepository from "../repository/users.repository.js";
import defaultUploadService from "./upload.service.js";

export class UserImagesService {
  constructor({
    userImagesRepository = defaultUserImagesRepository,
    usersRepository = defaultUsersRepository,
    uploadService = defaultUploadService,
  } = {}) {
    this.userImagesRepository = userImagesRepository;
    this.usersRepository = usersRepository;
    this.uploadService = uploadService;
  }

  #removeUploadedFiles(files) {
    return Promise.all(
      files.map((file) => this.uploadService.deleteUploadedFile(file.key)),
    );
  }

  async uploadAndSave(userId, files) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const uploadedFiles = await this.uploadService.formatUploadedFiles(files);

    try {
      const savedImages = await this.userImagesRepository.createMany(
        userId,
        uploadedFiles.map((file) => file.url),
      );

      return uploadedFiles.map((file, index) => ({
        ...file,
        id: savedImages[index].id,
        userId: savedImages[index].user_id,
        createdAt: savedImages[index].created_at,
      }));
    } catch (error) {
      await this.#removeUploadedFiles(uploadedFiles);
      throw error;
    }
  }

  async deleteFile(userId, imageId) {
    const image = await this.userImagesRepository.findByIdAndUserId(
      imageId,
      userId,
    );
    if (!image) throw new NotFoundError("Image not found for this user");

    const deletedFromR2 = await this.uploadService.deleteUploadedFile(
      image.image_url,
    );
    if (!deletedFromR2) {
      throw new BadGatewayError("Could not delete image from R2");
    }

    const deletedImage = await this.userImagesRepository.removeByIdAndUserId(
      imageId,
      userId,
    );

    if (!deletedImage) throw new NotFoundError("Image not found for this user");
    return deletedImage;
  }
}

export default new UserImagesService();
