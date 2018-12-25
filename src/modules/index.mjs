

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import MergeSchema from 'merge-graphql-schemas';

import fs from "fs";

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema



class RouteModule extends PrismaModule {

 

  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), []);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getRouteComponentTypes(types = []) {

    types = types.concat([
      "Resource",
    ]);

    return `
      enum RouteComponent{
        ${types.join(",\n")}
      }
    `;
  }
 

  getResolvers() {

    const resolvers = super.getResolvers();

    Object.assign(resolvers.Query, {
      routes: this.routes,
      route: this.route,
      routesConnection: this.routesConnection,
    });

    Object.assign(resolvers.Mutation, {
    });

    Object.assign(resolvers, {
    });

    return resolvers;
  }


  route(source, args, ctx, info) {

    return ctx.db.query.route({}, info);
  }


  routes(source, args, ctx, info) {

    return ctx.db.query.routes({}, info);
  }


  routesConnection(source, args, ctx, info) {

    return ctx.db.query.routesConnection({}, info);
  }


}


export default RouteModule;