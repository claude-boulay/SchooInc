import { Pool } from "pg";
import { query as gradingQuery } from "./db.js";
import {
    cleanupGradesForInvalidCourses,
    deleteGradesByProfessorId,
} from "./models/grades.model.js";

// Fetch enrollment/course data from Service_School via GraphQL
const fetchSchoolDataViaGraphQL = async () => {
    const schoolServiceUrl = process.env.SCHOOL_SERVICE_URL || "http://localhost:4002/graphql";

    try {
        const response = await fetch(schoolServiceUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `{
          School {
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
          }
        }`
            })
        });

        if (!response.ok) {
            throw new Error(`School service returned ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(`GraphQL error: ${data.errors.map(e => e.message).join(", ")}`);
        }

        return data.data?.School || {};
    } catch (error) {
        console.error("Error fetching school data via GraphQL:", error);
        return {};
    }
};

export const syncClassEnrollmentsFromSchool = async () => {
    try {
        const schoolData = await fetchSchoolDataViaGraphQL();
        const enrollments = schoolData.classEnrollments || [];

        // Clear grading_db class_enrollments
        await gradingQuery("DELETE FROM class_enrollments");

        // Insert all records
        for (const enrollment of enrollments) {
            await gradingQuery(
                "INSERT INTO class_enrollments (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [enrollment.classId, enrollment.studentId]
            );
        }

        console.log(`✓ Synced ${enrollments.length} class enrollments`);
    } catch (error) {
        console.error("Error syncing class_enrollments:", error);
    }
};

export const syncClassCoursesFromSchool = async () => {
    try {
        const schoolData = await fetchSchoolDataViaGraphQL();
        const courses = schoolData.classCourses || [];

        // Clear grading_db class_courses
        await gradingQuery("DELETE FROM class_courses");

        // Insert all records
        for (const course of courses) {
            await gradingQuery(
                "INSERT INTO class_courses (class_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [course.classId, course.courseId]
            );
        }

        console.log(`✓ Synced ${courses.length} class courses`);
    } catch (error) {
        console.error("Error syncing class_courses:", error);
    }
};

export const syncSchoolData = async () => {
    console.log("🔄 Syncing school data into grading service...");
    await syncClassEnrollmentsFromSchool();
    await syncClassCoursesFromSchool();
    await cleanupOrphanGrades();
    console.log("✓ School data sync complete");
};

export const cleanupOrphanGrades = async () => {
    try {
        const schoolData = await fetchSchoolDataViaGraphQL();
        const courses = schoolData.courses || [];

        // Get valid course IDs with professors
        const validCourseIds = courses
            .filter((c) => c.professorId !== null && c.professorId !== undefined)
            .map((c) => c.id);

        // Find orphaned professors (courses with no professor_id)
        const orphanedProfessorIds = new Set();
        const result = await gradingQuery(
            "SELECT DISTINCT professor_id FROM grades WHERE professor_id IS NOT NULL"
        );

        for (const row of result.rows) {
            const professorExists = courses.some((c) => c.professorId === row.professor_id);
            if (!professorExists) {
                orphanedProfessorIds.add(row.professor_id);
            }
        }

        // Delete grades for orphaned professors
        for (const professorId of orphanedProfessorIds) {
            const deletedCount = await deleteGradesByProfessorId(professorId);
            if (deletedCount > 0) {
                console.log(`✓ Deleted ${deletedCount} grades for orphaned professor ${professorId}`);
            }
        }

        // Cleanup grades for invalid courses (courses without professors or deleted courses)
        const deletedCount = await cleanupGradesForInvalidCourses(validCourseIds);
        if (deletedCount > 0) {
            console.log(`✓ Deleted ${deletedCount} grades for invalid/orphaned courses`);
        }
    } catch (error) {
        console.error("Error cleaning up orphan grades:", error);
    }
};

export const closeSchoolPool = async () => {
    // No pool to close in this version
};
