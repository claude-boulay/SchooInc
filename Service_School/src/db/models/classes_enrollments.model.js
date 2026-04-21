import { query } from "../db.js";

const ENROLLMENT_COLUMNS = `
	class_id,
	student_id,
	enrolled_at
`;

const mapEnrollment = (row) => {
	if (!row) {
		return null;
	}

	return {
		classId: row.class_id,
		studentId: row.student_id,
		enrolledAt: row.enrolled_at,
	};
};

export const addStudentToClass = async ({ classId, studentId }) => {
	const result = await query(
		`
			INSERT INTO class_enrollments (class_id, student_id)
			VALUES ($1, $2)
			RETURNING ${ENROLLMENT_COLUMNS}
		`,
		[classId, studentId]
	);

	return mapEnrollment(result.rows[0]);
};

export const removeStudentFromClass = async ({ classId, studentId }) => {
	const result = await query(
		`
			DELETE FROM class_enrollments
			WHERE class_id = $1 AND student_id = $2
			RETURNING ${ENROLLMENT_COLUMNS}
		`,
		[classId, studentId]
	);

	return mapEnrollment(result.rows[0]);
};

export const listEnrollmentsByClassId = async (classId) => {
	const result = await query(
		`
			SELECT ${ENROLLMENT_COLUMNS}
			FROM class_enrollments
			WHERE class_id = $1
			ORDER BY enrolled_at DESC
		`,
		[classId]
	);

	return result.rows.map(mapEnrollment);
};
