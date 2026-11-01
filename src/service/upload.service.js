import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import crypto from "crypto";
import path from "path";
import { r2Client } from "../config/R2.config.js";
import { config } from "../config/env.config.js";

const { bucketName, publicUrl } = config.r2;

export const formatUploadedFile = async (file) => {
  if (!file) return null;

  const extension = path.extname(file.originalname);
  const filename = `${crypto.randomUUID()}${extension}`;

  const key = `uploads/${filename}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return {
    filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    key,
    url: `${publicUrl}/${key}`,
  };
};

export const formatUploadedFiles = async (files) => {
  const uploadResults = await Promise.allSettled(files.map(formatUploadedFile));
  const failedUpload = uploadResults.find(
    (result) => result.status === "rejected",
  );

  if (failedUpload) {
    const uploadedFiles = uploadResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    await Promise.all(
      uploadedFiles.map((file) => deleteUploadedFile(file.key)),
    );
    throw failedUpload.reason;
  }

  return uploadResults.map((result) => result.value);
};

export const deleteUploadedFile = async (fileUrlOrKey) => {
  if (!fileUrlOrKey) return false;

  try {
    let key = fileUrlOrKey;

    if (fileUrlOrKey.startsWith("http")) {
      const url = new URL(fileUrlOrKey);
      key = url.pathname.replace(/^\/+/, "");
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    return true;
  } catch (error) {
    console.error(
      `[UploadService] Lỗi xóa file R2: ${fileUrlOrKey}`,
      error.message,
    );

    return false;
  }
};
