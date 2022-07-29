import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server } from "http";
import { RequestMethod, Constructor } from "../models";

export function createExpressApp(): Express {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(cookieParser());

  return app;
}

export class Application {
  private _server?: Server;

  constructor(private _expressApp: Express) {}

  get expressApp() {
    return this._expressApp;
  }

  public start(port: number) {
    return new Promise<void>((res) => {
      this._server = this._expressApp.listen(port, () => {
        res();
      });
    });
  }

  public stop() {
    return new Promise<void>((res, rej) => {
      if (!this._server) {
        rej(new Error("No server instance"));
      }
      this._server?.close((err) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
  }

  public addHandler(
    method: RequestMethod,
    path: string,
    ...functionHandlers: FunctionHandler[]
  ): void;
  public addHandler(
    method: RequestMethod,
    path: string,
    ...classHandlers: ClassHandler[]
  ): void;
  public addHandler(
    method: RequestMethod,
    path: string,
    ...classOrFunctionHandlers: FunctionHandler[] | ClassHandler[]
  ): void {
    if (isClassHandlerArray(classOrFunctionHandlers)) {
      const handlers = classOrFunctionHandlers.map(({ instance, handler }) => {
        return handler.bind(instance);
      });
      this._expressApp[method](path, ...handlers);
      return;
    }

    this._expressApp[method](path, ...classOrFunctionHandlers);
  }
}

export interface FunctionHandler {
  (req: Request, res: Response, next?: NextFunction): void;
}

export interface ClassHandler {
  instance: InstanceType<Constructor>;
  handler: (req: Request, res: Response, next?: NextFunction) => void;
}

function isClassHandlerArray(object: unknown[]): object is ClassHandler[] {
  for (const o of object) {
    if (
      typeof (o as ClassHandler).instance !== "object" ||
      typeof (o as ClassHandler).handler !== "function"
    )
      return false;
  }
  return true;
}
