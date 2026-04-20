import { Pool } from "pg";

const pool = new Pool({
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT || 5432),
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "postgres",
	database: process.env.DB_NAME || "schoolinc_users",
	max: Number(process.env.DB_POOL_MAX || 10),
	idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
	connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
});

pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error:", error);
});

export const query = (text, params = []) => pool.query(text, params);

export const getClient = () => pool.connect();

export const healthcheckDb = async () => {
	const result = await query("SELECT NOW() AS now");
	return result.rows[0];
};

export const closeDb = async () => {
	await pool.end();
};

export default pool;
