export const inputDefs = `
	input RegisterInput {
		email: String!
		pseudo: String!
		password: String!
		role: UserRole = STUDENT
	}

	input LoginInput {
		email: String!
		password: String!
	}

	input UpdateMeInput {
		email: String
		pseudo: String
		password: String
	}
`;
