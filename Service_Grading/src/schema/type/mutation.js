export const mutationTypeDefs = `
  type Mutation {
    createGrade(input: CreateGradeInput!): Grade!
    createGradesForEvent(input: GradeEventBatchInput!): [Grade!]!
    updateGrade(input: UpdateGradeInput!): Grade!
    deleteGrade(id: ID!): Boolean!
    deleteCourseGrades(courseId: ID!): DeleteResult!
    deleteProfessorGrades(professorId: ID!): DeleteResult!
  }
`;
