import { query } from "../db.js";

const USER_COLUMNS = `
	id,
	email,
	pseudo,
	password,
	role,
	created_at,
	updated_at
`;

const mapRow = (row) => {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		email: row.email,
		pseudo: row.pseudo,
		password: row.password,
		role: row.role,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

export const findAllUsers = async () => {
	const result = await query(
		`SELECT ${USER_COLUMNS} FROM users ORDER BY created_at DESC`
	);
	return result.rows.map(mapRow);
};

export const findUserById = async (id) => {
	const result = await query(
		`SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
		[id]
	);
	return mapRow(result.rows[0]);
};

export const findUserByEmail = async (email) => {
	const result = await query(
		`SELECT ${USER_COLUMNS} FROM users WHERE email = $1 LIMIT 1`,
		[email]
	);
	return mapRow(result.rows[0]);
};

export const findUserByPseudo = async (pseudo) => {
	const result = await query(
		`SELECT ${USER_COLUMNS} FROM users WHERE pseudo = $1 LIMIT 1`,
		[pseudo]
	);
	return mapRow(result.rows[0]);
};

export const createUser = async ({ email, pseudo, password, role = "STUDENT" }) => {
	const result = await query(
		`
			INSERT INTO users (email, pseudo, password, role)
			VALUES ($1, $2, $3, $4::user_role)
			RETURNING ${USER_COLUMNS}
		`,
		[email, pseudo, password, role]
	);

	return mapRow(result.rows[0]);
};

export const updateUserById = async (id, payload) => {
	const fields = [];
	const values = [];

	if (payload.email !== undefined) {
		values.push(payload.email);
		fields.push(`email = $${values.length}`);
	}

	if (payload.pseudo !== undefined) {
		values.push(payload.pseudo);
		fields.push(`pseudo = $${values.length}`);
	}

	if (payload.password !== undefined) {
		values.push(payload.password);
		fields.push(`password = $${values.length}`);
	}

	if (payload.role !== undefined) {
		values.push(payload.role);
		fields.push(`role = $${values.length}::user_role`);
	}

	if (fields.length === 0) {
		return findUserById(id);
	}

	values.push(id);

	const result = await query(
		`
			UPDATE users
			SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
			WHERE id = $${values.length}
			RETURNING ${USER_COLUMNS}
		`,
		values
	);

	return mapRow(result.rows[0]);
};

export const deleteUserById = async (id) => {
	const result = await query(
		`
			DELETE FROM users
			WHERE id = $1
			RETURNING ${USER_COLUMNS}
		`,
		[id]
	);

	return mapRow(result.rows[0]);
};
