import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "./utils/auth.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import db from "./config/connection.js";
import { graphqlUploadExpress } from "graphql-upload-minimal";
import cors from "cors";
import stripeWebhook from "./utils/stripeWebhook.js";
import stripe from "./utils/stripe.js"; // Import your Stripe instance

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: false,
});

const startApolloServer = async () => {
  await server.start();

  if (process.env.NODE_ENV === "development") {
    const corsOptions = {
      origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
      credentials: true,
    };
    app.use(cors(corsOptions));
  }

  app.use("/stripe", stripeWebhook);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use("/images", express.static(path.join(__dirname, "../client/images")));

  app.use(graphqlUploadExpress());

  app.post("/api/get-checkout-session", async (req, res) => {
    const { sessionId } = req.body;

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.json(session);
    } catch (error) {
      console.error("Error retrieving Stripe session:", error);
      res.status(500).send({ error: "Failed to retrieve session" });
    }
  });

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log("Request headers:", req.headers);
        return authMiddleware({ req });
      },
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  try {
    await db();
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

startApolloServer();
