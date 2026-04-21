export const inputDefs = `
  input CreateGradeInput {
    value: Float!
    studentId: ID!
    courseId: ID!
    eventId: ID
    comment: String
  }

  input UpdateGradeInput {
    id: ID!
    value: Float!
    eventId: ID
    comment: String
  }

  input GradePerStudentInput {
    studentId: ID!
    value: Float!
    comment: String
  }

  input GradeEventBatchInput {
    eventId: ID!
    courseId: ID!
    grades: [GradePerStudentInput!]!
  }
`;
