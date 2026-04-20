export const mutationTypeDefs = `
	type Mutation {
		register(input: RegisterInput!): AuthPayload!
		login(input: LoginInput!): AuthPayload!
		updateMe(input: UpdateMeInput!): User!
		deleteMe: Boolean!
	}
`;
