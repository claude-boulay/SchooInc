export const mutationTypeDefs = `
  type Mutation {
    createGrade(input: CreateGradeInput!): Grade!
    updateGrade(input: UpdateGradeInput!): Grade!
    deleteGrade(id: ID!): Boolean!
  }
`;
