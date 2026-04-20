export const queryTypeDefs = `
  type Query {
    myGrades: [GradeByCoursed!]!
    gradesByCourse(courseId: ID!): [Grade!]!
    gradesByStudent(studentId: ID!): [Grade!]!
    gradesByClass(classId: ID!): [Grade!]!
    studentStats(studentId: ID!, courseId: ID): GradeStats!
    courseStats(courseId: ID!): GradeStats!
    classStats(classId: ID!): GradeStats!
  }
`;
