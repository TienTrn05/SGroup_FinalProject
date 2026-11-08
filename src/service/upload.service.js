import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import crypto from "crypto";
import path from "path";
import { r2Client } from "../config/R2.config.js";
import { config } from "../config/env.config.js";

export class UploadService {
  constructor({
    client = r2Client,
    bucketName = config.r2.bucketName,
    publicUrl = config.r2.publicUrl,
  } = {}) {
    this.client = client;
    this.bucketName = bucketName;
    this.publicUrl = publicUrl;
  }

  async formatUploadedFile(file) {
    if (!file) return null;

    const extension = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}${extension}`;

    const key = `uploads/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
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
      url: `${this.publicUrl}/${key}`,
    };
  }

  async formatUploadedFiles(files) {
    const uploadResults = await Promise.allSettled(
      files.map((file) => this.formatUploadedFile(file)),
    );
    const failedUpload = uploadResults.find(
      (result) => result.status === "rejected",
    );

    if (failedUpload) {
      const uploadedFiles = uploadResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      await Promise.all(
        uploadedFiles.map((file) => this.deleteUploadedFile(file.key)),
      );
      throw failedUpload.reason;
    }

    return uploadResults.map((result) => result.value);
  }

  async deleteUploadedFile(fileUrlOrKey) {
    if (!fileUrlOrKey) return false;

    try {
      let key = fileUrlOrKey;

      if (fileUrlOrKey.startsWith("http")) {
        const url = new URL(fileUrlOrKey);
        key = url.pathname.replace(/^\/+/, "");
      }

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
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
  }
}

export default new UploadService();
