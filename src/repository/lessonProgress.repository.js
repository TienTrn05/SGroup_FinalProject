import pool from "../config/db.config.js";

export const complete = async (lessonId, memberId) => {
  const result = await pool.query(
    `INSERT INTO public.lesson_progress (lesson_id, member_id) VALUES ($1, $2)
     ON CONFLICT (lesson_id, member_id) DO UPDATE SET member_id = EXCLUDED.member_id
     RETURNING id, lesson_id, member_id, completed_at`,
    [lessonId, memberId],
  );

  return result.rows[0];
};

export const getClassProgress = async (classId, memberId) => {
  const result = await pool.query(
    `SELECT COUNT(*)::integer AS total, COUNT(lp.id)::integer AS completed
     FROM public.lessons l
     LEFT JOIN public.lesson_progress lp ON lp.lesson_id = l.id AND lp.member_id = $2
     WHERE l.class_id = $1`,
    [classId, memberId],
  );
  return result.rows[0];
};
