import { Response } from "express";
import {
  AuthenticationErrorType,
  Constructor,
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
} from "./models";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants";

export function JWTTokenResponder<
  T extends Constructor<{
    accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>;
    refreshTokenManager: JWTTokenManager<JWTTokenPayload>;
    errorHandler: ErrorHandler;
  }>
>(superClass: T) {
  return class JWTTokenResponderImpl extends superClass {
    public async respondWithTokens(res: Response, username: string) {
      let jwtToken: string;
      try {
        jwtToken = await this.accessJWTTokenManager.create({
          username,
        });
      } catch (err) {
        this.errorHandler(
          res,
          AuthenticationErrorType.TokenCreateError,
          err as Error
        );
        return;
      }

      let newRefreshToken: string;
      try {
        newRefreshToken = await this.refreshTokenManager.create({
          username,
        });
      } catch (err) {
        this.errorHandler(
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
  };
}

export type JWTTokenResponderType = InstanceType<
  ReturnType<typeof JWTTokenResponder>
>;
