const { ApolloServer } = require("apollo-server-lambda");
const { typeDefs, resolvers } = require("../../server/schemas/index.js");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
  }),
});

exports.handler = server.createHandler();
