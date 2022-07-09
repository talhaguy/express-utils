import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server } from "http";

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
}
