import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import * as userImagesService from "../service/userImages.service.js";

export const uploadSingleImage = catchAsync(async (req, res) => {
  const [result] = await userImagesService.uploadAndSave(req.params.id, [
    req.file,
  ]);

  return sendSuccess(res, 201, "Upload và lưu ảnh thành công", result);
});

export const uploadMultipleFiles = catchAsync(async (req, res) => {
  const results = await userImagesService.uploadAndSave(
    req.params.id,
    req.files,
  );

  return sendSuccess(res, 201, "Upload và lưu các ảnh thành công", results);
});
export const deleteFile = catchAsync(async (req, res) => {
  const deletedFile = await userImagesService.deleteFile(
    req.params.id,
    req.params.imageId,
  );

  return sendSuccess(res, 200, "Xóa file thành công", deletedFile);
});
