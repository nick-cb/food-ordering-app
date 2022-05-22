import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import app, { routeEvent } from "../express";
import { BasicResponse } from "../types/commonInterfaces";

export type RouteConfig = {
  method: "post" | "get" | "delete" | "put";
  path: string;
  middlewares?: Array<RequestHandler>;
};

const RouteSymbol = Symbol("RouteConfig");

export const routeConfig = (config: RouteConfig): MethodDecorator => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    target[RouteSymbol] = target[RouteSymbol] || new Map();
    if (target[RouteSymbol].get(propertyKey)) {
      target[RouteSymbol].set(propertyKey, {
        descriptor,
        propertyKey,
        ...config,
        ...target[RouteSymbol].get(propertyKey),
      });
    } else {
      target[RouteSymbol].set(propertyKey, {
        descriptor,
        propertyKey,
        ...config,
      });
    }
  };
};

export function controller<T extends { new (...args: any[]): {} }>(Base: T) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
      const routes = Base.prototype[RouteSymbol];
      if (routes) {
        routes.forEach(
          ({
            descriptor,
            method,
            path,
            middlewares,
            ...rest
          }: RouteConfig &
            RouteDescription & {
              descriptor: PropertyDescriptor;
              propertyKey: string | Symbol;
            }) => {
            const handler: Array<RequestHandler> = [];
            const main = async (
              req: Request,
              res: Response,
              next: NextFunction
            ): Promise<Response<BasicResponse<any>>> => {
              try {
                return await descriptor.value.apply(this, [req, res, next]);
              } catch (error: any) {
                console.log(error);
                if (error.code) {
                  return res
                    .status(error.code)
                    .json({ message: error.message, success: false });
                }
                return res
                  .status(500)
                  .json({ message: error.message, success: false });
              }
            };
            if (middlewares && middlewares.length > 0) {
              handler.push(
                ...middlewares.map(
                  (middleware) =>
                    async (req: Request, res: Response, next: NextFunction) => {
                      try {
                        return await middleware.apply(this, [req, res, next]);
                      } catch (error: any) {
                        return res
                          .status(500)
                          .json({ message: error.message, success: false });
                      }
                    }
                )
              );
            }
            handler.push(main);
            routeEvent.emit("update_route", {
              path,
              method,
              ...rest,
            });
            app[method]("/api" + path, handler);
          }
        );
      }
    }
  };
}

export type RouteDescription = {
  query?: object;
  request_payload?: object;
  response_payload?: object;
  usage?: string;
  isAuth?: boolean;
};
export const routeDescription = (description: RouteDescription) => {
  return (
    target: any,
    propertyKey: string | symbol,
    __: PropertyDescriptor
  ) => {
    target[RouteSymbol] = target[RouteSymbol] || new Map();
    if (target[RouteSymbol].get(propertyKey)) {
      target[RouteSymbol].set(propertyKey, {
        ...target[RouteSymbol].get(propertyKey),
        ...description,
      });
    } else {
      target[RouteSymbol].set(propertyKey, {
        ...description,
      });
    }
  };
};
