import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { ensureSchema, healthcheckDb } from "./db/db.js";
import { syncSchoolData } from "./db/sync.js";
import { resolvers } from "./schema/resolver/resolvers.js";
import { typeDefs } from "./schema/schema.js";

const PORT = Number(process.env.PORT || 4003);
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

const getCurrentUser = (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      pseudo: payload.pseudo,
    };
  } catch {
    return null;
  }
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
await ensureSchema();
await syncSchoolData();
await server.start();

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      currentUser: getCurrentUser(req.headers.authorization),
    }),
  })
);

app.get("/health", async (_, res) => {
  try {
    const dbStatus = await healthcheckDb();
    res.status(200).json({ ok: true, db: dbStatus.now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Service_Grading listening on http://localhost:${PORT}/graphql`);
});
