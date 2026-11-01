import pool from "../config/db.config.js";

// DATE -> text keeps YYYY-MM-DD stable regardless of the server timezone.
const columns = `id, name, description, start_date::text, end_date::text,
  mentor_id, created_at, updated_at`;
const allowedFields = [
  "name",
  "description",
  "start_date",
  "end_date",
  "mentor_id",
];

export const findAllForUser = async (user) => {
  const result = await pool.query(
    `SELECT ${columns}
     FROM public.classes
     WHERE $1::boolean OR mentor_id = $2
       OR EXISTS (
         SELECT 1 FROM public.class_members cm
         WHERE cm.class_id = classes.id AND cm.member_id = $2
       )
     ORDER BY id`,
    [user.role === "ADMIN", user.id],
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${columns} FROM public.classes WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

export const isMember = async (classId, userId) => {
  const result = await pool.query(
    `SELECT 1 FROM public.class_members
     WHERE class_id = $1 AND member_id = $2 LIMIT 1`,
    [classId, userId],
  );
  return result.rows.length > 0;
};

export const create = async ({
  name,
  description = null,
  start_date = null,
  end_date = null,
  mentor_id = null,
}) => {
  const result = await pool.query(
    `INSERT INTO public.classes (name, description, start_date, end_date, mentor_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${columns}`,
    [name, description, start_date, end_date, mentor_id],
  );
  return result.rows[0];
};

export const update = async (id, changes) => {
  const fields = allowedFields.filter((field) => changes[field] !== undefined);
  if (fields.length === 0) return findById(id);

  // Column names come only from the allowlist; values remain parameterized.
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  assignments.push("updated_at = CURRENT_TIMESTAMP");
  const values = fields.map((field) => changes[field]);
  values.push(id);

  const result = await pool.query(
    `UPDATE public.classes SET ${assignments.join(", ")}
     WHERE id = $${values.length} RETURNING ${columns}`,
    values,
  );
  return result.rows[0] || null;
};

export const remove = async (id) => {
  // Uses the existing DB's ON DELETE CASCADE; see docs/classes.md before calling.
  const result = await pool.query(
    `DELETE FROM public.classes WHERE id = $1 RETURNING ${columns}`,
    [id],
  );
  return result.rows[0] || null;
};
