

import PrismaProcessor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import chalk from "chalk";

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




class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    // this.mergeModules([ 
    // ]);


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



  getResolvers() {


    return {
      Query: {
        route: this.route.bind(this),
        routes: this.routes.bind(this),
        routesConnection: this.routesConnection.bind(this),
      },
      Mutation: {
        createRouteProcessor: this.createRouteProcessor.bind(this),
        updateRouteProcessor: this.updateRouteProcessor.bind(this),
        deleteRoute: this.deleteRoute.bind(this),
        deleteManyRoutes: this.deleteManyRoutes.bind(this),
      },
      Subscription: {
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


export default Module;
