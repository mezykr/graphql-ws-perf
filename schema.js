const { gql } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

setInterval(() => {
  pubsub.publish("TEST", {});
}, 200);

const typeDefs = gql`
  type Query {
    nothing: String
  }
  type Subscription {
    test(param1: Float!, param2: Float!): Test!
  }

  type Test {
    result: Float!
  }
`;

const resolvers = {
  Query: {
    nothing: () => null,
  },
  Subscription: {
    test: {
      resolve: async (_, { param1, param2 }) => {
        return {
          result: param1 + param2,
        };
      },
      subscribe: () => pubsub.asyncIterator(["TEST"]),
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
