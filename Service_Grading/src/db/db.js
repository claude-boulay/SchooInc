import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5435),
  user: process.env.DB_USER || "grading_user",
  password: process.env.DB_PASSWORD || "grading_pass",
  database: process.env.DB_NAME || "grading_db",
  max: Number(process.env.DB_POOL_MAX || 10),
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export const query = (text, params = []) => pool.query(text, params);

export const getClient = () => pool.connect();

export const ensureSchema = async () => {
  // Support tables for joining grades with class/course info
  await query(`
    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id UUID NOT NULL,
      student_id UUID NOT NULL,
      enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (class_id, student_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS class_courses (
      class_id UUID NOT NULL,
      course_id UUID NOT NULL,
      PRIMARY KEY (class_id, course_id)
    )
  `);

  // Add event_id column if not exists
  await query("ALTER TABLE grades ADD COLUMN IF NOT EXISTS event_id UUID");

  // Create indexes
  await query("CREATE INDEX IF NOT EXISTS idx_grades_event ON grades(event_id)");
  await query(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_grades_event_student_unique ON grades(event_id, student_id) WHERE event_id IS NOT NULL"
  );
  await query("CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id)");
  await query("CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id)");
  await query("CREATE INDEX IF NOT EXISTS idx_class_courses_class ON class_courses(class_id)");
  await query("CREATE INDEX IF NOT EXISTS idx_class_courses_course ON class_courses(course_id)");
};

export const healthcheckDb = async () => {
  const result = await query("SELECT NOW() AS now");
  return result.rows[0];
};

export default pool;
