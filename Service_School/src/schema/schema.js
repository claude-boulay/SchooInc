import { inputDefs } from "./type/inputs.js";
import { mutationTypeDefs } from "./type/mutation.js";
import { queryTypeDefs } from "./type/query.js";

export const typeDefs = `
  type Class {
    id: ID!
    name: String!
    professorId: ID!
    createdAt: String!
    studentCount: Int!
    enrollments: [ClassEnrollment!]!
    courses: [Course!]!
    events: [CalendarEvent!]!
  }

  type ClassEnrollment {
    classId: ID!
    studentId: ID!
    enrolledAt: String!
  }

  type ClassPage {
    items: [Class!]!
    total: Int!
    limit: Int!
    offset: Int!
    hasNext: Boolean!
  }

  type Course {
    id: ID!
    name: String!
    professorId: ID!
  }

  type CalendarEvent {
    id: ID!
    startTime: String!
    endTime: String!
    courseId: ID!
    classId: ID!
    professorId: ID!
    createdAt: String!
    course: Course
    class: Class
  }

  ${inputDefs}
  ${queryTypeDefs}
  ${mutationTypeDefs}
`;
