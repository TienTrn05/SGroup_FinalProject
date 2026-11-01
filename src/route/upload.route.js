import { Router } from "express";
import * as uploadController from "../controller/upload.controller.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../middleware/upload.middleware.js";
import {
  validate,
  userIdRules,
  userImageIdRules,
} from "../middleware/validate.js";

const router = Router();

router.post(
  "/users/:id/image",
  validate(userIdRules),
  uploadSingleImage("image"),
  uploadController.uploadSingleImage,
);

router.post(
  "/users/:id/images",
  validate(userIdRules),
  uploadMultipleImages("images", 5),
  uploadController.uploadMultipleFiles,
);

router.delete(
  "/users/:id/images/:imageId",
  validate(userImageIdRules),
  uploadController.deleteFile,
);
export default router;
