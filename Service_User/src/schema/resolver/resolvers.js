import { mutations } from "./mutations.js";
import { queries } from "./queries.js";

export const resolvers = {
	Query: queries,
	Mutation: mutations,
	User: {
		createdAt: (user) =>
			user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
		updatedAt: (user) =>
			user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
	},
};
