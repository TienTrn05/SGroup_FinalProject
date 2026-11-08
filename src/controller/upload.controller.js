import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import defaultUserImagesService from "../service/userImages.service.js";

export class UploadController {
  constructor(service = defaultUserImagesService) {
    this.service = service;
    this.uploadSingleImage = catchAsync(this.uploadSingleImage.bind(this));
    this.uploadMultipleFiles = catchAsync(this.uploadMultipleFiles.bind(this));
    this.deleteFile = catchAsync(this.deleteFile.bind(this));
  }

  async uploadSingleImage(req, res) {
    const [result] = await this.service.uploadAndSave(req.params.id, [req.file]);

    return sendSuccess(res, 201, "Upload và lưu ảnh thành công", result);
  }

  async uploadMultipleFiles(req, res) {
    const results = await this.service.uploadAndSave(
      req.params.id,
      req.files,
    );

    return sendSuccess(res, 201, "Upload và lưu các ảnh thành công", results);
  }

  async deleteFile(req, res) {
    const deletedFile = await this.service.deleteFile(
      req.params.id,
      req.params.imageId,
    );

    return sendSuccess(res, 200, "Xóa file thành công", deletedFile);
  }
}

export default new UploadController();
