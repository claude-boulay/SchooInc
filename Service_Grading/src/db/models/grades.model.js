import { query } from "../db.js";

const GRADE_COLUMNS = `
  id,
  value,
  student_id,
  course_id,
  professor_id,
  comment,
  created_at,
  updated_at
`;

const mapGrade = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    value: parseFloat(row.value),
    studentId: row.student_id,
    courseId: row.course_id,
    professorId: row.professor_id,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const listGradesByStudent = async (studentId) => {
  const result = await query(
    `
      SELECT ${GRADE_COLUMNS}
      FROM grades
      WHERE student_id = $1
      ORDER BY course_id, created_at DESC
    `,
    [studentId]
  );

  return result.rows.map(mapGrade);
};

export const listGradesByCourse = async (courseId) => {
  const result = await query(
    `
      SELECT ${GRADE_COLUMNS}
      FROM grades
      WHERE course_id = $1
      ORDER BY student_id, created_at DESC
    `,
    [courseId]
  );

  return result.rows.map(mapGrade);
};

export const listGradesByClass = async (classId) => {
  const result = await query(
    `
      SELECT g.${GRADE_COLUMNS.split(",").join(", g.")}
      FROM grades g
      INNER JOIN class_enrollments ce ON g.student_id = ce.student_id
      INNER JOIN class_courses cc ON ce.class_id = cc.class_id AND g.course_id = cc.course_id
      WHERE ce.class_id = $1
      ORDER BY g.student_id, g.course_id, g.created_at DESC
    `,
    [classId]
  );

  return result.rows.map(mapGrade);
};

export const createGrade = async ({ value, studentId, courseId, professorId, comment }) => {
  const result = await query(
    `
      INSERT INTO grades (value, student_id, course_id, professor_id, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${GRADE_COLUMNS}
    `,
    [value, studentId, courseId, professorId, comment]
  );

  return mapGrade(result.rows[0]);
};

export const updateGradeById = async (id, { value, comment }) => {
  const result = await query(
    `
      UPDATE grades
      SET value = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING ${GRADE_COLUMNS}
    `,
    [value, comment, id]
  );

  return mapGrade(result.rows[0]);
};

export const deleteGradeById = async (id) => {
  const result = await query(
    `
      DELETE FROM grades
      WHERE id = $1
      RETURNING ${GRADE_COLUMNS}
    `,
    [id]
  );

  return mapGrade(result.rows[0]);
};

export const findGradeById = async (id) => {
  const result = await query(
    `
      SELECT ${GRADE_COLUMNS}
      FROM grades
      WHERE id = $1 LIMIT 1
    `,
    [id]
  );

  return mapGrade(result.rows[0]);
};

export const getGradeStatsForStudent = async (studentId, courseId = null) => {
  let whereClause = "WHERE student_id = $1";
  const params = [studentId];

  if (courseId) {
    whereClause += " AND course_id = $2";
    params.push(courseId);
  }

  const result = await query(
    `
      SELECT
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median,
        MIN(value)::DECIMAL(4,2) as min_grade,
        MAX(value)::DECIMAL(4,2) as max_grade,
        AVG(value)::DECIMAL(4,2) as average,
        COUNT(*)::INT as count
      FROM grades
      ${whereClause}
    `,
    params
  );

  const row = result.rows[0];
  return {
    median: row.median ? parseFloat(row.median) : null,
    minGrade: row.min_grade ? parseFloat(row.min_grade) : null,
    maxGrade: row.max_grade ? parseFloat(row.max_grade) : null,
    average: row.average ? parseFloat(row.average) : null,
    count: row.count || 0,
  };
};

export const getGradeStatsForCourse = async (courseId) => {
  const result = await query(
    `
      SELECT
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median,
        MIN(value)::DECIMAL(4,2) as min_grade,
        MAX(value)::DECIMAL(4,2) as max_grade,
        AVG(value)::DECIMAL(4,2) as average,
        COUNT(*)::INT as count
      FROM grades
      WHERE course_id = $1
    `,
    [courseId]
  );

  const row = result.rows[0];
  return {
    median: row.median ? parseFloat(row.median) : null,
    minGrade: row.min_grade ? parseFloat(row.min_grade) : null,
    maxGrade: row.max_grade ? parseFloat(row.max_grade) : null,
    average: row.average ? parseFloat(row.average) : null,
    count: row.count || 0,
  };
};

export const getGradeStatsForClass = async (classId) => {
  const result = await query(
    `
      SELECT
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY g.value) as median,
        MIN(g.value)::DECIMAL(4,2) as min_grade,
        MAX(g.value)::DECIMAL(4,2) as max_grade,
        AVG(g.value)::DECIMAL(4,2) as average,
        COUNT(*)::INT as count
      FROM grades g
      INNER JOIN class_enrollments ce ON g.student_id = ce.student_id
      INNER JOIN class_courses cc ON ce.class_id = cc.class_id AND g.course_id = cc.course_id
      WHERE ce.class_id = $1
    `,
    [classId]
  );

  const row = result.rows[0];
  return {
    median: row.median ? parseFloat(row.median) : null,
    minGrade: row.min_grade ? parseFloat(row.min_grade) : null,
    maxGrade: row.max_grade ? parseFloat(row.max_grade) : null,
    average: row.average ? parseFloat(row.average) : null,
    count: row.count || 0,
  };
};
