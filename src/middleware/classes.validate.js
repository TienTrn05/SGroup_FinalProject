import { body, param } from "express-validator";

const allowedFields = [
  "name",
  "description",
  "start_date",
  "end_date",
  "mentor_id",
];
const bodyRule = () =>
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body must be a JSON object");
    }
    if (Object.keys(value).some((key) => !allowedFields.includes(key))) {
      throw new Error(`Only ${allowedFields.join(", ")} are allowed`);
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
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must contain 1 to 255 characters");
};

const optionalRules = () => [
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string or null"),
  ...["start_date", "end_date"].map((field) =>
    body(field)
      .optional({ values: "null" })
      .isString()
      .bail()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage(`${field} must use YYYY-MM-DD`)
      .bail()
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage(`${field} must be a valid calendar date`)
      .bail()
      .custom((value) => value.slice(0, 4) !== "0000")
      .withMessage(`${field} year must be greater than zero`),
  ),
  body("mentor_id")
    .optional({ values: "null" })
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("mentor_id must be a positive PostgreSQL integer or null")
    .toInt(),
];

export const classIdRules = [
  param("classId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("classId must be a positive PostgreSQL integer")
    .toInt(),
];

export const createClassRules = [bodyRule(), nameRule(), ...optionalRules()];

export const updateClassRules = [
  ...classIdRules,
  bodyRule(),
  body().custom((value) => {
    if (!value || !allowedFields.some((field) => Object.hasOwn(value, field))) {
      throw new Error("At least one class field is required");
    }
    return true;
  }),
  nameRule(true),
  ...optionalRules(),
];
