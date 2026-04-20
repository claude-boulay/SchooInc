import { mutations } from "./mutations.js";
import { queries } from "./queries.js";

export const resolvers = {
  Query: queries,
  Mutation: mutations,
  Grade: {
    createdAt: (grade) =>
      grade.createdAt instanceof Date ? grade.createdAt.toISOString() : grade.createdAt,
    updatedAt: (grade) =>
      grade.updatedAt instanceof Date ? grade.updatedAt.toISOString() : grade.updatedAt,
  },
};
