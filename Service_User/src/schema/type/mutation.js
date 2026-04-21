export const mutationTypeDefs = `
	type Mutation {
		register(input: RegisterInput!): AuthPayload!
		login(input: LoginInput!): AuthPayload!
		requestPasswordReset(input: RequestPasswordResetInput!): Boolean!
		resetPassword(input: ResetPasswordInput!): Boolean!
		updateMe(input: UpdateMeInput!): User!
		deleteMe: Boolean!
	}
`;
