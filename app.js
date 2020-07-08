const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schemas");
const resolvers = require("./resolvers");
const repository = require("./repository");
const logger = require("./logger")("main");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, repository }),
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  logger.debug(`🚀  Server ready at ${url}`);
});
