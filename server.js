const express = require("express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const { typeDefs, resolvers } = require("./schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { execute, subscribe } = require("graphql");
const { register, plugin, wsClients } = require("./metrics");

const PORT = 8080;
const METRICS_PORT = 9091;
const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const metricsApp = express();
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscriptions",
});

(async () => {
  const apolloServer = new ApolloServer({
    schema,
    resolvers,
    plugins: [plugin],
  });

  useServer(
    {
      schema,
      execute,
      subscribe,
    },
    wsServer
  );

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Apollo Server ready at http://localhost:${PORT}/graphql`);
    console.log(
      `🚀 Subscriptions Server ready at http://localhost:${PORT}/subscriptions`
    );
  });

  metricsApp.get("/metrics", (_, res) => {
    wsClients.set({ transport: "graphql-ws" }, wsServer.clients.size);
    res.set("content-type", register.contentType);
    res.end(register.metrics());
  });

  metricsApp.listen({ port: METRICS_PORT }, () => {
    console.log(
      `🚀 Metrics Server ready at http://localhost:${METRICS_PORT}/metrics`
    );
  });
})();
