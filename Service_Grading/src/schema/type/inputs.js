export const inputDefs = `
  input CreateGradeInput {
    value: Float!
    studentId: ID!
    courseId: ID!
    comment: String
  }

  input UpdateGradeInput {
    id: ID!
    value: Float!
    comment: String
  }
`;
