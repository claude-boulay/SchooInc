export const inputDefs = `
  input ClassCreateInput {
    name: String!
  }

  input ClassUpdateInput {
    id: ID!
    name: String!
  }

  input AddStudentToClassInput {
    classId: ID!
    studentId: ID!
  }

  input CourseCreateInput {
    name: String!
  }

  input CourseUpdateInput {
    id: ID!
    name: String!
  }

  input AddCourseToClassInput {
    classId: ID!
    courseId: ID!
  }
`;
