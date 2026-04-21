import { query } from "../db.js";

const CLASS_COLUMNS = `
	id,
	name,
	professor_id,
	created_at
`;

const mapClass = (row) => {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		professorId: row.professor_id,
		createdAt: row.created_at,
	};
};

export const listClasses = async ({ sort = "ASC", limit = 20, offset = 0 }) => {
	const sortDirection = sort === "DESC" ? "DESC" : "ASC";
	const result = await query(
		`
			SELECT ${CLASS_COLUMNS}
			FROM classes
			ORDER BY name ${sortDirection}
			LIMIT $1 OFFSET $2
		`,
		[limit, offset]
	);

	return result.rows.map(mapClass);
};

export const countClasses = async () => {
	const result = await query("SELECT COUNT(*)::int AS total FROM classes");
	return result.rows[0].total;
};

export const findClassById = async (id) => {
	const result = await query(
		`SELECT ${CLASS_COLUMNS} FROM classes WHERE id = $1 LIMIT 1`,
		[id]
	);

	return mapClass(result.rows[0]);
};

export const createClass = async ({ name, professorId }) => {
	const result = await query(
		`
			INSERT INTO classes (name, professor_id)
			VALUES ($1, $2)
			RETURNING ${CLASS_COLUMNS}
		`,
		[name, professorId]
	);

	return mapClass(result.rows[0]);
};

export const updateClassById = async ({ id, name }) => {
	const result = await query(
		`
			UPDATE classes
			SET name = $1
			WHERE id = $2
			RETURNING ${CLASS_COLUMNS}
		`,
		[name, id]
	);

	return mapClass(result.rows[0]);
};

export const deleteClassById = async (id) => {
	const result = await query(
		`
			DELETE FROM classes
			WHERE id = $1
			RETURNING ${CLASS_COLUMNS}
		`,
		[id]
	);

	return mapClass(result.rows[0]);
};

export const countStudentsInClass = async (classId) => {
	const result = await query(
		`
			SELECT COUNT(*)::int AS total
			FROM class_enrollments
			WHERE class_id = $1
		`,
		[classId]
	);

	return result.rows[0].total;
};

export const findClassByStudentId = async (studentId) => {
	const result = await query(
		`
			SELECT ${CLASS_COLUMNS}
			FROM classes
			WHERE id = (
				SELECT class_id FROM class_enrollments WHERE student_id = $1 LIMIT 1
			)
		`,
		[studentId]
	);

	return mapClass(result.rows[0]);
};

export const listClassProfessorIds = async () => {
	const result = await query(
		"SELECT DISTINCT professor_id FROM classes ORDER BY professor_id ASC"
	);

	return result.rows.map((row) => row.professor_id);
};

export const deleteClassesByProfessorId = async (professorId) => {
	const classIdsResult = await query(
		"SELECT id FROM classes WHERE professor_id = $1",
		[professorId]
	);

	const classIds = classIdsResult.rows.map((row) => row.id);
	if (classIds.length === 0) {
		return 0;
	}

	await query("DELETE FROM class_enrollments WHERE class_id = ANY($1::uuid[])", [
		classIds,
	]);

	const deleted = await query(
		"DELETE FROM classes WHERE professor_id = $1 RETURNING id",
		[professorId]
	);

	return deleted.rowCount;
};
