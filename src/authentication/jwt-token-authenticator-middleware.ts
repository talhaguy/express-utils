import { NextFunction, Request, Response } from "express";
import { JWTHelper, JWTTokenPayload } from "./models";

export class JWTTokenAuthenticatorMiddleware {
  constructor(private _jwtSecret: string, private _jwtHelper: JWTHelper) {}

  public async handler(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      res.status(401).end();
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    let payload: JWTTokenPayload;
    try {
      payload = await this._jwtHelper.validate<JWTTokenPayload>(
        this._jwtSecret,
        token
      );
    } catch {
      res.status(401).end();
      return;
    }

    res.locals["username"] = payload.username;
    next();
  }
}
