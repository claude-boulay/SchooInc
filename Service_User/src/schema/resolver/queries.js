import { findAllUsers, findUserById } from "../../db/models/users.model.js";

export const queries = {
	users: async () => findAllUsers(),

	user: async (_, { id }) => findUserById(id),

	me: async (_, __, context) => {
		if (!context.currentUser?.id) {
			return null;
		}

		return findUserById(context.currentUser.id);
	},
};
