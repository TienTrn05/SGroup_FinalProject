import { BadGatewayError, NotFoundError } from "../core/error.response.js";
import * as userImagesRepository from "../repository/userImages.repository.js";
import * as usersRepository from "../repository/users.repository.js";
import * as uploadService from "./upload.service.js";

const removeUploadedFiles = (files) =>
  Promise.all(files.map((file) => uploadService.deleteUploadedFile(file.key)));

export const uploadAndSave = async (userId, files) => {
  const user = await usersRepository.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const uploadedFiles = await uploadService.formatUploadedFiles(files);

  try {
    const savedImages = await userImagesRepository.createMany(
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
    await removeUploadedFiles(uploadedFiles);
    throw error;
  }
};

export const deleteFile = async (userId, imageId) => {
  const image = await userImagesRepository.findByIdAndUserId(imageId, userId);
  if (!image) throw new NotFoundError("Image not found for this user");

  const deletedFromR2 = await uploadService.deleteUploadedFile(image.image_url);
  if (!deletedFromR2) {
    throw new BadGatewayError("Could not delete image from R2");
  }

  const deletedImage = await userImagesRepository.removeByIdAndUserId(
    imageId,
    userId,
  );

  if (!deletedImage) throw new NotFoundError("Image not found for this user");
  return deletedImage;
};
