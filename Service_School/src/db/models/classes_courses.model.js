import { query } from "../db.js";

export const addCourseToClass = async ({ classId, courseId }) => {
  const result = await query(
    `
      INSERT INTO class_courses (class_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT (class_id, course_id) DO NOTHING
      RETURNING class_id, course_id
    `,
    [classId, courseId]
  );

  return result.rows[0] || { class_id: classId, course_id: courseId };
};

export const listCoursesByClassId = async (classId) => {
  const result = await query(
    `
      SELECT c.id, c.name, c.professor_id
      FROM courses c
      INNER JOIN class_courses cc ON c.id = cc.course_id
      WHERE cc.class_id = $1
      ORDER BY c.name ASC
    `,
    [classId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    professorId: row.professor_id,
  }));
};
