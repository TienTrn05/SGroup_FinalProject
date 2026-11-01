import pool from "../config/db.config.js";

const columns = "id, class_id, title, content, order_index, created_by";

export const findByClassId = async (classId) => {
  const result = await pool.query(
    `SELECT ${columns} FROM public.lessons WHERE class_id = $1 ORDER BY order_index, id`,
    [classId],
  );
  return result.rows;
};

export const findById = async (lessonId) => {
  const result = await pool.query(
    `SELECT ${columns} FROM public.lessons WHERE id = $1`,
    [lessonId],
  );
  return result.rows[0] || null;
};

export const create = async (
  classId,
  { title, content = null, order_index },
  creatorId,
) => {
  const result = await pool.query(
    `INSERT INTO public.lessons (class_id, title, content, order_index, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${columns}`,
    [classId, title, content, order_index, creatorId],
  );
  return result.rows[0];
};

export const update = async (lessonId, changes) => {
  const fields = ["title", "content", "order_index"].filter(
    (field) => changes[field] !== undefined,
  );
  if (fields.length === 0) return findById(lessonId);
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = fields.map((field) => changes[field]);
  values.push(lessonId);
  const result = await pool.query(
    `UPDATE public.lessons SET ${assignments.join(", ")} WHERE id = $${values.length}
     RETURNING ${columns}`,
    values,
  );
  return result.rows[0] || null;
};

export const remove = async (lessonId) => {
  const result = await pool.query(
    `DELETE FROM public.lessons WHERE id = $1 RETURNING ${columns}`,
    [lessonId],
  );
  return result.rows[0] || null;
};
