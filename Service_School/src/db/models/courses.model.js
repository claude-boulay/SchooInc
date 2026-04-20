import { query } from "../db.js";

const COURSE_COLUMNS = `
	id,
	name,
	professor_id
`;

const mapCourse = (row) => {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		professorId: row.professor_id,
	};
};

export const listCourses = async () => {
	const result = await query(`SELECT ${COURSE_COLUMNS} FROM courses ORDER BY name ASC`);
	return result.rows.map(mapCourse);
};

export const findCourseById = async (id) => {
	const result = await query(
		`SELECT ${COURSE_COLUMNS} FROM courses WHERE id = $1 LIMIT 1`,
		[id]
	);
	return mapCourse(result.rows[0]);
};

export const createCourse = async ({ name, professorId }) => {
	const result = await query(
		`
			INSERT INTO courses (name, professor_id)
			VALUES ($1, $2)
			RETURNING ${COURSE_COLUMNS}
		`,
		[name, professorId]
	);
	return mapCourse(result.rows[0]);
};

export const updateCourseById = async ({ id, name }) => {
	const result = await query(
		`
			UPDATE courses
			SET name = $1
			WHERE id = $2
			RETURNING ${COURSE_COLUMNS}
		`,
		[name, id]
	);
	return mapCourse(result.rows[0]);
};

export const deleteCourseById = async (id) => {
	const result = await query(
		`
			DELETE FROM courses
			WHERE id = $1
			RETURNING ${COURSE_COLUMNS}
		`,
		[id]
	);
	return mapCourse(result.rows[0]);
};
