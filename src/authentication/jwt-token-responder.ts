import { Response } from "express";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
} from "./models";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants";

export class JWTTokenResponder {
  constructor(
    protected _accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>,
    protected _refreshTokenManager: JWTTokenManager<JWTTokenPayload>,
    protected _errorHandler: ErrorHandler
  ) {}
  public async respondWithTokens(res: Response, username: string) {
    let jwtToken: string;
    try {
      jwtToken = await this._accessJWTTokenManager.create({
        username,
      });
    } catch (err) {
      this._errorHandler(
        res,
        AuthenticationErrorType.TokenCreateError,
        err as Error
      );
      return;
    }

    let newRefreshToken: string;
    try {
      newRefreshToken = await this._refreshTokenManager.create({
        username,
      });
    } catch (err) {
      this._errorHandler(
        res,
        AuthenticationErrorType.TokenCreateError,
        err as Error
      );
      return;
    }

    res
      .cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
        expires: new Date(Date.now() + 30 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        token: jwtToken,
      });
  }
}
