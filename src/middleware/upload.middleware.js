import multer from "multer";
import { BadRequestError } from "../core/error.response.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(
        new BadRequestError(
          "Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP và GIF.",
        ),
      );
    }

    callback(null, true);
  },
});

const normalizeUploadError = (error, fieldName) => {
  if (!(error instanceof multer.MulterError)) return error;

  if (error.code === "LIMIT_FILE_SIZE") {
    return new BadRequestError("Mỗi file không được vượt quá 5 MB.");
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return new BadRequestError(
      `Sai field hoặc vượt quá số file cho phép. Field hợp lệ là '${fieldName}'.`,
    );
  }

  return new BadRequestError(`Lỗi upload file: ${error.message}`);
};

const runUpload = (handler, fieldName, validateFiles) => (req, res, next) => {
  handler(req, res, (error) => {
    if (error) return next(normalizeUploadError(error, fieldName));

    const validationError = validateFiles(req);
    if (validationError) return next(validationError);

    next();
  });
};

export const uploadSingleImage = (fieldName = "file") =>
  runUpload(multerUpload.single(fieldName), fieldName, (req) =>
    req.file
      ? null
      : new BadRequestError(`Vui lòng chọn một file với field '${fieldName}'.`),
  );

export const uploadMultipleImages = (fieldName = "files", maxCount = 5) =>
  runUpload(multerUpload.array(fieldName, maxCount), fieldName, (req) =>
    req.files?.length
      ? null
      : new BadRequestError(`Vui lòng chọn file với field '${fieldName}'.`),
  );
