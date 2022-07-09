import { NextFunction, Request, Response } from "express";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTHelper,
  JWTTokenPayload,
} from "./models";

export class JWTTokenAuthenticatorMiddleware {
  constructor(
    private _jwtSecret: string,
    private _jwtHelper: JWTHelper,
    private _errorHandler: ErrorHandler
  ) {}

  public async handler(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      this._errorHandler(res, AuthenticationErrorType.NoJWTToken);
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    let payload: JWTTokenPayload;
    try {
      payload = await this._jwtHelper.validate<JWTTokenPayload>(
        this._jwtSecret,
        token
      );
    } catch (err) {
      this._errorHandler(
        res,
        AuthenticationErrorType.InvalidJWTToken,
        err as Error
      );
      return;
    }

    res.locals["username"] = payload.username;
    next();
  }
}
