
import fs from "fs";

import PrismaProcessor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import chalk from "chalk";

import TemplateModule from "./Template";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema


class RouteProcessor extends PrismaProcessor {


  constructor(props) {

    super(props);

    this.objectType = "Route";

    this.private = true;

  }


  async create(objectType, args, info) {


    let {
      data: {
        ...data
      },
      ...otherArgs
    } = args;


    const {
      id: currentUserId,
    } = await this.getUser(true);


    Object.assign(data, {
      CreatedBy: {
        connect: {
          id: currentUserId,
        },
      },
    });

    return super.create(objectType, {
      data,
      ...otherArgs,
    }, info);

  }


  async mutate(objectType, args, into) {

    return super.mutate(objectType, args);
  }

}




class RouteModule extends PrismaModule {


  constructor(props = {}) {

    super(props);

    this.mergeModules([ 
      TemplateModule,
    ]);


    this.RouteResponse = {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source && source.data || {};

        return id ? ctx.db.query.route({
          where: {
            id,
          },
        }, info) : null;

      },
    }

  }


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

    let apiSchema = super.getApiSchema(types.concat(baseSchema), [
    ]);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });

    return apiSchema;

  }



  getResolvers() {


    const {
      Query,
      Mutation,
      Subscription,
      ...other
    } = super.getResolvers();

    return {
      ...other,
      Query: {
        ...Query,
        route: this.route.bind(this),
        routes: this.routes.bind(this),
        routesConnection: this.routesConnection.bind(this),
      },
      Mutation: {
        ...Mutation,
        createRouteProcessor: this.createRouteProcessor.bind(this),
        updateRouteProcessor: this.updateRouteProcessor.bind(this),
        deleteRoute: this.deleteRoute.bind(this),
        deleteManyRoutes: this.deleteManyRoutes.bind(this),
      },
      Subscription: {
        ...Subscription,
        route: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.route(args, info)
          },
        },
      },
      RouteResponse: this.RouteResponse,
    }

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return RouteProcessor;
  }


  routes(source, args, ctx, info) {
    return ctx.db.query.routes({}, info);
  }

  route(source, args, ctx, info) {
    return ctx.db.query.route({}, info);
  }

  routesConnection(source, args, ctx, info) {
    return ctx.db.query.routesConnection({}, info);
  }


  createRouteProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Route", args, info);
  }

  updateRouteProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Route", args, info);
  }


  deleteRoute(source, args, ctx, info) {
    return ctx.db.mutation.deleteRoute({}, info);
  }


  deleteManyRoutes(source, args, ctx, info) {
    return ctx.db.mutation.deleteManyRoutes({}, info);
  }

}


export default RouteModule;
