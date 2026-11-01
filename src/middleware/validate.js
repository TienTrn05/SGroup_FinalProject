import { BadRequestError } from "../core/error.response.js";
import { validationResult, body, param } from "express-validator";

export const validate = (rules) => async (req, res, next) => {
  for (const rule of rules) await rule.run(req);
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const error = new BadRequestError("Validation failed");
  // Omit rejected values, which may contain a password.
  error.errors = errors
    .array()
    .map((err) => ({ field: err.path, message: err.msg }));
  return next(error);
};

const allowedFields = ["name", "email", "password", "role"];
const bodyRules = () =>
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body must be a JSON object");
    }
    if (Object.keys(value).some((key) => !allowedFields.includes(key))) {
      throw new Error("Only name, email, password and role are allowed");
    }
    return true;
  });

const nameRule = (optional = false) => {
  const rule = body("name");
  if (optional) rule.optional();
  return rule
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters");
};

const emailRule = (optional = false) => {
  const rule = body("email");
  if (optional) rule.optional();
  return rule
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters")
    .isEmail()
    .withMessage("Email is not valid")
    .bail()
    .customSanitizer((value) => value.toLowerCase());
};

const passwordRule = (optional = false) => {
  const rule = body("password");
  if (optional) rule.optional();
  return rule
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters");
};

const roleRule = () =>
  body("role")
    .optional()
    .isString()
    .bail()
    .isIn(["ADMIN", "MEMBER"])
    .withMessage("Role must be ADMIN or MEMBER");

export const userIdRules = [
  param("id")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("User ID must be a positive PostgreSQL integer")
    .toInt(),
];

export const userImageIdRules = [
  ...userIdRules,
  param("imageId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Image ID must be a positive PostgreSQL integer")
    .toInt(),
];

export const createUserRules = [
  bodyRules(),
  nameRule(),
  emailRule(),
  passwordRule(),
  roleRule(),
];

export const updateUserRules = [
  ...userIdRules,
  bodyRules(),
  body().custom((value) => {
    if (
      !value ||
      !allowedFields.some((field) =>
        Object.prototype.hasOwnProperty.call(value, field),
      )
    ) {
      throw new Error(
        "At least one of name, email, password or role is required",
      );
    }
    return true;
  }),
  nameRule(true),
  emailRule(true),
  passwordRule(true),
  roleRule(),
];

export const deleteUserRules = userIdRules;
