import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
	createUser,
	deleteUserById,
	findUserByEmail,
	findUserById,
	findUserByPseudo,
	updateUserById,
} from "../../db/models/users.model.js";
import { deleteProfessorGradesInGradingService } from "../../integrations/gradingService.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || `${JWT_SECRET}-password-reset`;
const RESET_TOKEN_EXPIRES_IN = process.env.RESET_TOKEN_EXPIRES_IN || "15m";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
const IS_DEV = process.env.NODE_ENV !== "production";

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

	requestPasswordReset: async (_, { input }) => {
		const email = String(input.email || "").trim().toLowerCase();
		const user = await findUserByEmail(email);

		// Always return true to avoid account enumeration.
		if (!user) {
			return true;
		}

		const resetToken = jwt.sign(
			{
				sub: user.id,
				email: user.email,
				purpose: "password_reset",
				jti: crypto.randomUUID(),
			},
			RESET_TOKEN_SECRET,
			{ expiresIn: RESET_TOKEN_EXPIRES_IN }
		);

		if (IS_DEV) {
			console.warn("[DEV ONLY] Password reset token generated");
			console.info("User email:", user.email);
			console.info("Reset token:", resetToken);
		}

		return true;
	},

	resetPassword: async (_, { input }) => {
		const newPassword = String(input.newPassword || "");
		if (newPassword.length < 6) {
			throw new Error("Password must be at least 6 characters long");
		}

		let payload;
		try {
			payload = jwt.verify(input.token, RESET_TOKEN_SECRET);
		} catch {
			throw new Error("Invalid or expired reset token");
		}

		if (payload.purpose !== "password_reset") {
			throw new Error("Invalid reset token purpose");
		}

		const user = await findUserById(payload.sub);
		if (!user || user.email !== payload.email) {
			throw new Error("User not found for reset token");
		}

		const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
		await updateUserById(user.id, { password: hashedPassword });

		return true;
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

		const userId = context.currentUser.id;
		const userRole = context.currentUser.role;

		const deletedUser = await deleteUserById(userId);

		// Delete grades if this is a professor
		if (deletedUser && userRole === "PROFESSOR") {
			await deleteProfessorGradesInGradingService(userId);
		}

		return Boolean(deletedUser);
	},
};
