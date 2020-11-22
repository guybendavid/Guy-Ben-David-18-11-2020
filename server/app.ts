import { ApolloServer } from "apollo-server";
import { sequelize } from "./db/models";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import contextMiddleware from "./utils/contextMiddleware";
import pino from "pino";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware
});

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

sequelize.authenticate()
  .then(() => logger.info("Database connected!"))
  .then(() => server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    logger.info(`Server ready at ${url}`);
  }))
  .catch((err: Error) => logger.error(err));