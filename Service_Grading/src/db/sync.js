import { Pool } from "pg";
import { query as gradingQuery } from "./db.js";

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
    console.log("✓ School data sync complete");
};

export const closeSchoolPool = async () => {
    // No pool to close in this version
};
