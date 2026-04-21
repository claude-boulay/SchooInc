import { query } from "../db.js";

export const findCalendarEventsByClassId = async (classId) => {
  const result = await query(
    "SELECT * FROM calendar_events WHERE class_id = $1 ORDER BY start_time ASC",
    [classId]
  );
  return result.rows.map(mapDbToModel);
};

export const findCalendarEventById = async (id) => {
  const result = await query("SELECT * FROM calendar_events WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ? mapDbToModel(result.rows[0]) : null;
};

export const createCalendarEvent = async ({
  startTime,
  endTime,
  courseId,
  classId,
  professorId,
}) => {
  const result = await query(
    `INSERT INTO calendar_events (start_time, end_time, course_id, class_id, professor_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [startTime, endTime, courseId, classId, professorId]
  );
  return mapDbToModel(result.rows[0]);
};

export const updateCalendarEventById = async ({
  id,
  startTime,
  endTime,
  courseId,
  classId,
}) => {
  const result = await query(
    `UPDATE calendar_events
     SET start_time = COALESCE($1, start_time),
         end_time = COALESCE($2, end_time),
         course_id = COALESCE($3, course_id),
         class_id = COALESCE($4, class_id)
     WHERE id = $5 RETURNING *`,
    [startTime, endTime, courseId, classId, id]
  );
  return result.rows[0] ? mapDbToModel(result.rows[0]) : null;
};

export const deleteCalendarEventById = async (id) => {
  const result = await query(
    "DELETE FROM calendar_events WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount > 0;
};

const mapDbToModel = (row) => ({
  id: row.id,
  startTime: row.start_time.toISOString(),
  endTime: row.end_time.toISOString(),
  courseId: row.course_id,
  classId: row.class_id,
  professorId: row.professor_id,
  createdAt: row.created_at.toISOString(),
});
