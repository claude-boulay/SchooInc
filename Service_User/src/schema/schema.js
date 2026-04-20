import { inputDefs } from "./type/inputs.js";
import { mutationTypeDefs } from "./type/mutation.js";
import { queryTypeDefs } from "./type/query.js";

export const typeDefs = `
	enum UserRole {
		STUDENT
		PROFESSOR
	}

	type User {
		id: ID!
		email: String!
		pseudo: String!
		role: UserRole!
		createdAt: String!
		updatedAt: String!
	}

	type AuthPayload {
		token: String!
		user: User!
	}

	${inputDefs}
	${queryTypeDefs}
	${mutationTypeDefs}
`;
