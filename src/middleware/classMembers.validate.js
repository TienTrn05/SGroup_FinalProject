import { body, param } from "express-validator";
import { classIdRules } from "./classes.validate.js";

export const addClassMemberRules = [
  ...classIdRules,
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body must be a JSON object");
    }
    if (Object.keys(value).some((key) => key !== "memberId")) {
      throw new Error("Only memberId is allowed");
    }
    return true;
  }),
  body("memberId")
    .custom((value) => typeof value === "number" || typeof value === "string")
    .withMessage("memberId must be an integer or an integer string")
    .bail()
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("memberId must be a positive PostgreSQL integer")
    .toInt(),
];

export const removeClassMemberRules = [
  ...classIdRules,
  param("memberId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("memberId must be a positive PostgreSQL integer")
    .toInt(),
];
