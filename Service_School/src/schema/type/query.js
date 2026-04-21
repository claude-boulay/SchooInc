export const queryTypeDefs = `
  enum SortOrder {
    ASC
    DESC
  }

  type Query {
    classes(sort: SortOrder = ASC, limit: Int = 20, offset: Int = 0): ClassPage!
    class(id: ID!): Class
    courses: [Course!]!
    course(id: ID!): Course
    studentClass(studentId: ID!): Class
    classCalendarEvents(classId: ID!): [CalendarEvent!]!
  }
`;
