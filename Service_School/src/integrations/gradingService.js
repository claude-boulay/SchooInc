export const deleteCourseGradesInGradingService = async (courseId) => {
    const gradingServiceUrl = process.env.GRADING_SERVICE_URL || "http://localhost:4003/graphql";

    try {
        const response = await fetch(gradingServiceUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `mutation DeleteCourseGrades($courseId: ID!) {
          deleteCourseGrades(courseId: $courseId) {
            success
            deletedCount
          }
        }`,
                variables: { courseId },
            }),
        });

        if (!response.ok) {
            console.error(`Grading service returned ${response.status}`);
            return;
        }

        const data = await response.json();
        if (data.errors) {
            console.error("Error deleting course grades:", data.errors);
            return;
        }

        const deletedCount = data.data?.deleteCourseGrades?.deletedCount;
        if (deletedCount > 0) {
            console.log(`✓ Deleted ${deletedCount} grades for course ${courseId} in grading service`);
        }
    } catch (error) {
        console.error("Error calling grading service to delete course grades:", error);
    }
};

export const deleteProfessorGradesInGradingService = async (professorId) => {
    const gradingServiceUrl = process.env.GRADING_SERVICE_URL || "http://localhost:4003/graphql";

    try {
        const response = await fetch(gradingServiceUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `mutation DeleteProfessorGrades($professorId: ID!) {
          deleteProfessorGrades(professorId: $professorId) {
            success
            deletedCount
          }
        }`,
                variables: { professorId },
            }),
        });

        if (!response.ok) {
            console.error(`Grading service returned ${response.status}`);
            return;
        }

        const data = await response.json();
        if (data.errors) {
            console.error("Error deleting professor grades:", data.errors);
            return;
        }

        const deletedCount = data.data?.deleteProfessorGrades?.deletedCount;
        if (deletedCount > 0) {
            console.log(`✓ Deleted ${deletedCount} grades for professor ${professorId} in grading service`);
        }
    } catch (error) {
        console.error("Error calling grading service to delete professor grades:", error);
    }
};
