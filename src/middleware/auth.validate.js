import { body } from "express-validator";

const onlyFields = (fields) =>
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body must be a JSON object");
    }
    if (Object.keys(value).some((key) => !fields.includes(key))) {
      throw new Error(`Only ${fields.join(", ")} are allowed`);
    }
    return true;
  });

const emailRule = () =>
  body("email")
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

const passwordRule = () =>
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters");

export const registerRules = [
  onlyFields(["name", "email", "password"]),
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  emailRule(),
  passwordRule(),
];

export const loginRules = [
  onlyFields(["email", "password"]),
  emailRule(),
  passwordRule(),
];

const refreshTokenRules = () => [
  onlyFields(["refreshToken"]),
  body("refreshToken")
    .isString()
    .withMessage("Refresh token must be a string")
    .bail()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

export const refreshRules = refreshTokenRules();
export const logoutRules = refreshTokenRules();
