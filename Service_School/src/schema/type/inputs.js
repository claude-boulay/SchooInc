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

  input RemoveStudentFromClassInput {
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

  input CalendarEventCreateInput {
    startTime: String!
    endTime: String!
    courseId: ID!
    classId: ID!
  }

  input CalendarEventUpdateInput {
    id: ID!
    startTime: String
    endTime: String
    courseId: ID
    classId: ID
  }
`;
