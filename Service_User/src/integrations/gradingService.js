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
