import { query as gradingQuery } from "./db.js";
import {
    cleanupGradesForInvalidCourses,
    deleteGradesByProfessorId,
} from "./models/grades.model.js";

// Fetch enrollment/course data from Service_School via GraphQL.
// Returns { ok: true, data } on success and { ok: false } on any failure.
const fetchSchoolDataViaGraphQL = async () => {
    const schoolServiceUrl = process.env.SCHOOL_SERVICE_URL || "http://localhost:4002/graphql";

    try {
        const response = await fetch(schoolServiceUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Direct call to Service_School - no `School { ... }` wrapper here.
                // That namespace is added by the Gateway's encapsulate transform.
                query: `{
          classEnrollments {
            classId
            studentId
          }
          classCourses {
            classId
            courseId
          }
          courses {
            id
            name
            professorId
          }
        }`,
            }),
        });

        if (!response.ok) {
            throw new Error(`School service returned ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(`GraphQL error: ${data.errors.map((e) => e.message).join(", ")}`);
        }

        return { ok: true, data: data.data || {} };
    } catch (error) {
        console.error("Error fetching school data via GraphQL:", error.message);
        return { ok: false };
    }
};

// Retry the fetch a few times with short backoff while Service_School is booting.
const fetchSchoolDataWithRetry = async (maxAttempts = 10, delayMs = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const result = await fetchSchoolDataViaGraphQL();
        if (result.ok) {
            return result;
        }

        if (attempt < maxAttempts) {
            console.warn(
                `[sync] School service unreachable (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    return { ok: false };
};

export const syncSchoolData = async () => {
    console.log("Syncing school data into grading service...");

    const result = await fetchSchoolDataWithRetry();
    if (!result.ok) {
        // CRITICAL: if we cannot reach Service_School we must NOT mutate anything.
        // Treating an empty response as truth would wipe grades and cache tables.
        console.warn(
            "[sync] Skipping school data sync: Service_School is unreachable. Existing data preserved."
        );
        return;
    }

    const schoolData = result.data;

    try {
        await syncClassEnrollments(schoolData.classEnrollments || []);
        await syncClassCourses(schoolData.classCourses || []);
        await cleanupOrphanGrades(schoolData.courses || []);
        console.log("School data sync complete");
    } catch (error) {
        console.error("[sync] Error during school data sync:", error);
    }
};

const syncClassEnrollments = async (enrollments) => {
    await gradingQuery("DELETE FROM class_enrollments");
    for (const enrollment of enrollments) {
        await gradingQuery(
            "INSERT INTO class_enrollments (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [enrollment.classId, enrollment.studentId]
        );
    }
    console.log(`Synced ${enrollments.length} class enrollments`);
};

const syncClassCourses = async (classCourses) => {
    await gradingQuery("DELETE FROM class_courses");
    for (const link of classCourses) {
        await gradingQuery(
            "INSERT INTO class_courses (class_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [link.classId, link.courseId]
        );
    }
    console.log(`Synced ${classCourses.length} class courses`);
};

const cleanupOrphanGrades = async (courses) => {
    // Extra safety: never run the destructive cleanup on an empty course list.
    // An empty list is almost always a sign that the upstream service answered
    // before its data was initialized - refuse to wipe anything in that case.
    if (!Array.isArray(courses) || courses.length === 0) {
        console.warn("[sync] Received no courses from Service_School, skipping orphan cleanup.");
        return;
    }

    const validCourseIds = courses
        .filter((c) => c.professorId !== null && c.professorId !== undefined)
        .map((c) => c.id);

    const knownProfessorIds = new Set(
        courses.map((c) => c.professorId).filter((id) => id !== null && id !== undefined)
    );

    const orphanedProfessorIds = new Set();
    const result = await gradingQuery(
        "SELECT DISTINCT professor_id FROM grades WHERE professor_id IS NOT NULL"
    );

    for (const row of result.rows) {
        if (!knownProfessorIds.has(row.professor_id)) {
            orphanedProfessorIds.add(row.professor_id);
        }
    }

    for (const professorId of orphanedProfessorIds) {
        const deletedCount = await deleteGradesByProfessorId(professorId);
        if (deletedCount > 0) {
            console.log(`Deleted ${deletedCount} grades for orphaned professor ${professorId}`);
        }
    }

    const deletedCount = await cleanupGradesForInvalidCourses(validCourseIds);
    if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} grades for invalid/orphaned courses`);
    }
};

export const closeSchoolPool = async () => {
    // No pool to close in this version.
};
