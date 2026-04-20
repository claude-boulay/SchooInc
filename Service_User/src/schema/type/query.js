export const queryTypeDefs = `
	type Query {
		users: [User!]!
		user(id: ID!): User
		me: User
	}
`;
