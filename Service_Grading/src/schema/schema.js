import { inputDefs } from "./type/inputs.js";
import { mutationTypeDefs } from "./type/mutation.js";
import { queryTypeDefs } from "./type/query.js";

export const typeDefs = `
  type Grade {
    id: ID!
    value: Float!
    studentId: ID!
    courseId: ID!
    eventId: ID
    professorId: ID!
    comment: String
    createdAt: String!
    updatedAt: String!
  }

  type GradeStats {
    median: Float
    minGrade: Float
    maxGrade: Float
    average: Float
    count: Int!
  }

  type GradeByCoursed {
    courseId: ID!
    courseName: String
    grades: [Grade!]!
  }

  ${inputDefs}
  ${queryTypeDefs}
  ${mutationTypeDefs}
`;
