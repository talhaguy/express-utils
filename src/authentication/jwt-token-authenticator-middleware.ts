import { NextFunction, Request, Response } from "express";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
} from "./models";

export class JWTTokenAuthenticatorMiddleware {
  constructor(
    private _accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>,
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
      payload = await this._accessJWTTokenManager.verify(token);
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
