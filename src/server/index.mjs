
import startServer from "@prisma-cms/server";

import Module from "../";


const module = new Module({
});

const resolvers = module.getResolvers();
// console.log("resolvers", resolvers);

startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
});
