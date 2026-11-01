import { body, param } from "express-validator";
import { classIdRules } from "./classes.validate.js";

const fields = ["title", "content", "order_index"];
const bodyRule = () =>
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body must be a JSON object");
    }
    if (Object.keys(value).some((key) => !fields.includes(key))) {
      throw new Error(`Only ${fields.join(", ")} are allowed`);
    }
    return true;
  });

const fieldRules = (optional = false) => {
  const title = body("title");
  const order = body("order_index");
  if (optional) {
    title.optional();
    order.optional();
  }
  return [
    title
      .isString()
      .withMessage("Title must be a string")
      .bail()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must contain 1 to 255 characters"),
    body("content")
      .optional({ values: "null" })
      .isString()
      .withMessage("Content must be a string or null"),
    order
      .custom((value) => typeof value === "number" || typeof value === "string")
      .withMessage("order_index must be an integer or an integer string")
      .bail()
      .isInt({ min: 1, max: 2147483647 })
      .withMessage("order_index must be a positive PostgreSQL integer")
      .toInt(),
  ];
};

export const lessonIdRules = [
  param("lessonId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("lessonId must be a positive PostgreSQL integer")
    .toInt(),
];

export const createLessonRules = [...classIdRules, bodyRule(), ...fieldRules()];
export const updateLessonRules = [
  ...lessonIdRules,
  bodyRule(),
  body().custom((value) => {
    if (!value || !fields.some((field) => Object.hasOwn(value, field))) {
      throw new Error("At least one lesson field is required");
    }
    return true;
  }),
  ...fieldRules(true),
];

export const completeLessonRules = [
  ...lessonIdRules,
  body().custom((value) => {
    if (
      value !== undefined &&
      (!value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        Object.keys(value).length !== 0)
    ) {
      throw new Error("Completion accepts no body or an empty JSON object");
    }
    return true;
  }),
];
