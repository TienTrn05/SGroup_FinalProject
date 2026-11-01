import pool from "../config/db.config.js";

const publicColumns = "id, name, email, role, created_at, updated_at";

export const findAll = async () => {
  const result = await pool.query(
    `SELECT ${publicColumns}
     FROM public.users
     ORDER BY id`,
  );

  return result.rows;
};

export const findByEmail = async (email) => {
  const result = await pool.query(
    `SELECT ${publicColumns}, password_hash
     FROM public.users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email],
  );

  return result.rows[0] || null;
};

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${publicColumns}
     FROM public.users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

export const emailExists = async (email, excludedId = null) => {
  const result = await pool.query(
    `SELECT 1
     FROM public.users
     WHERE LOWER(email) = LOWER($1)
       AND ($2::integer IS NULL OR id <> $2)
     LIMIT 1`,
    [email, excludedId],
  );

  return result.rows.length > 0;
};

export const create = async ({
  name,
  email,
  password_hash,
  role = "MEMBER",
}) => {
  const result = await pool.query(
    `INSERT INTO public.users (
       name,
       email,
       password_hash,
       role
     )
     VALUES ($1, $2, $3, $4)
     RETURNING ${publicColumns}`,
    [name, email, password_hash, role],
  );

  return result.rows[0];
};

export const update = async (id, changes) => {
  const allowedFields = ["name", "email", "password_hash", "role"];

  const fields = allowedFields.filter((field) => changes[field] !== undefined);

  if (fields.length === 0) {
    return findById(id);
  }

  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);

  assignments.push("updated_at = CURRENT_TIMESTAMP");

  const values = fields.map((field) => changes[field]);
  values.push(id);

  const result = await pool.query(
    `UPDATE public.users
     SET ${assignments.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${publicColumns}`,
    values,
  );

  return result.rows[0] || null;
};

export const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM public.users
     WHERE id = $1
     RETURNING ${publicColumns}`,
    [id],
  );

  return result.rows[0] || null;
};
