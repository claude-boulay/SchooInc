import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
	createUser,
	deleteUserById,
	findUserByEmail,
	findUserById,
	findUserByPseudo,
	updateUserById,
} from "../../db/models/users.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

const createAuthToken = (user) =>
	jwt.sign(
		{
			sub: user.id,
			role: user.role,
			email: user.email,
			pseudo: user.pseudo,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);

const ensureAuthenticated = (context) => {
	if (!context.currentUser?.id) {
		throw new Error("Authentication required");
	}
};

export const mutations = {
	register: async (_, { input }) => {
		const { email, pseudo, password, role } = input;

		const [existingEmail, existingPseudo] = await Promise.all([
			findUserByEmail(email),
			findUserByPseudo(pseudo),
		]);

		if (existingEmail) {
			throw new Error("Email already in use");
		}

		if (existingPseudo) {
			throw new Error("Pseudo already in use");
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
		const user = await createUser({
			email,
			pseudo,
			password: hashedPassword,
			role,
		});

		const token = createAuthToken(user);
		return { token, user };
	},

	login: async (_, { input }) => {
		const { email, password } = input;
		const user = await findUserByEmail(email);

		if (!user) {
			throw new Error("Invalid credentials");
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			throw new Error("Invalid credentials");
		}

		const token = createAuthToken(user);
		return { token, user };
	},

	updateMe: async (_, { input }, context) => {
		ensureAuthenticated(context);

		if (input.email !== undefined) {
			const existingEmail = await findUserByEmail(input.email);
			if (existingEmail && existingEmail.id !== context.currentUser.id) {
				throw new Error("Email already in use");
			}
		}

		if (input.pseudo !== undefined) {
			const existingPseudo = await findUserByPseudo(input.pseudo);
			if (existingPseudo && existingPseudo.id !== context.currentUser.id) {
				throw new Error("Pseudo already in use");
			}
		}

		const payload = { ...input };
		if (payload.password !== undefined) {
			payload.password = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
		}

		const user = await updateUserById(context.currentUser.id, payload);
		if (!user) {
			throw new Error("User not found");
		}

		return user;
	},

	deleteMe: async (_, __, context) => {
		ensureAuthenticated(context);

		const deletedUser = await deleteUserById(context.currentUser.id);
		return Boolean(deletedUser);
	},
};
