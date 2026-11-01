import pool from "../config/db.config.js";

const publicColumns = "id, user_id, image_url, created_at";

export const createMany = async (userId, imageUrls) => {
  const result = await pool.query(
    `INSERT INTO public.user_images (user_id, image_url)
     SELECT $1, image_url
     FROM unnest($2::text[]) AS urls(image_url)
     RETURNING ${publicColumns}`,
    [userId, imageUrls],
  );
  return result.rows;
};
export const findByIdAndUserId = async (imageId, userId) => {
  const result = await pool.query(
    `SELECT ${publicColumns}
     FROM public.user_images
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [imageId, userId],
  );

  return result.rows[0] || null;
};

export const removeByIdAndUserId = async (imageId, userId) => {
  const result = await pool.query(
    `DELETE FROM public.user_images
     WHERE id = $1 AND user_id = $2
     RETURNING ${publicColumns}`,
    [imageId, userId],
  );

  return result.rows[0] || null;
};
