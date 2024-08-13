import { ApolloServer } from "@apollo/server";
import { startServerAndCreateLambdaHandler } from "@as-integrations/aws-lambda";
import { typeDefs, resolvers } from "../../server/schemas/index.js";
import connectDB from "../../server/config/connection.js";

let conn = null;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const handler = startServerAndCreateLambdaHandler(server, {
  context: async ({ event, context }) => {
    if (!conn) {
      conn = await connectDB();
    }
    // Add any additional context here
    return {};
  },
});
