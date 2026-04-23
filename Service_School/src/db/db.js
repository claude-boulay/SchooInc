import { Pool } from "pg";

const pool = new Pool({
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT || 5433),
	user: process.env.DB_USER || "school_user",
	password: process.env.DB_PASSWORD || "school_pass",
	database: process.env.DB_NAME || "school_db",
	max: Number(process.env.DB_POOL_MAX || 10),
});

pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error:", error);
});

export const query = (text, params = []) => pool.query(text, params);

export const getClient = () => pool.connect();

export const ensureSchema = async () => {
	await query(`
		CREATE TABLE IF NOT EXISTS calendar_events (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			start_time TIMESTAMP WITH TIME ZONE NOT NULL,
			end_time TIMESTAMP WITH TIME ZONE NOT NULL,
			course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
			class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
			professor_id UUID NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`);

	await query(
		"CREATE INDEX IF NOT EXISTS idx_calendar_events_class_id ON calendar_events(class_id)"
	);
	await query(
		"CREATE INDEX IF NOT EXISTS idx_calendar_events_course_id ON calendar_events(course_id)"
	);
};

export const healthcheckDb = async () => {
	const result = await query("SELECT NOW() AS now");
	return result.rows[0];
};

export default pool;
