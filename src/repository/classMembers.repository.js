import pool from "../config/db.config.js";

export const findByClassId = async (classId) => {
  const result = await pool.query(
    `SELECT cm.id, cm.class_id, cm.member_id, cm.joined_at,
       u.name, u.email, u.role
     FROM public.class_members cm
     JOIN public.users u ON u.id = cm.member_id
     WHERE cm.class_id = $1
     ORDER BY cm.id`,
    [classId],
  );
  return result.rows;
};

export const create = async (classId, memberId) => {
  const result = await pool.query(
    `INSERT INTO public.class_members (class_id, member_id)
     VALUES ($1, $2)
     RETURNING id, class_id, member_id, joined_at`,
    [classId, memberId],
  );
  return result.rows[0];
};

export const remove = async (classId, memberId) => {
  const result = await pool.query(
    `DELETE FROM public.class_members
     WHERE class_id = $1 AND member_id = $2
     RETURNING id, class_id, member_id, joined_at`,
    [classId, memberId],
  );
  return result.rows[0] || null;
};
