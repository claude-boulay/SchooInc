export const mutationTypeDefs = `
  type Mutation {
    createClass(input: ClassCreateInput!): Class!
    updateClass(input: ClassUpdateInput!): Class!
    deleteClass(id: ID!): Boolean!
    addStudentToClass(input: AddStudentToClassInput!): ClassEnrollment!
    removeStudentFromClass(input: RemoveStudentFromClassInput!): Boolean!

    createCourse(input: CourseCreateInput!): Course!
    updateCourse(input: CourseUpdateInput!): Course!
    deleteCourse(id: ID!): Boolean!
    addCourseToClass(input: AddCourseToClassInput!): Boolean!
  }
`;
