import { Response } from "express";
import {
  AuthenticationErrorType,
  Constructor,
  ErrorHandler,
  JWTHelper,
} from "./models";
import {
  DEFAULT_JWT_TOKEN_EXPIRY_MS,
  REFRESH_TOKEN_COOKIE_NAME,
  DEFAULT_REFRESH_TOKEN_EXPIRY_MS,
} from "./constants";

export function JWTTokenResponder<
  T extends Constructor<{
    jwtSecret: string;
    refreshSecret: string;
    jwtHelper: JWTHelper;
    errorHandler: ErrorHandler;
  }>
>(superClass: T) {
  return class JWTTokenResponderImpl extends superClass {
    public async respondWithTokens(res: Response, username: string) {
      let jwtToken: string;
      try {
        jwtToken = await this.jwtHelper.create(
          this.jwtSecret,
          {
            username,
          },
          DEFAULT_JWT_TOKEN_EXPIRY_MS
        );
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
        newRefreshToken = await this.jwtHelper.create(
          this.refreshSecret,
          {
            username,
          },
          DEFAULT_REFRESH_TOKEN_EXPIRY_MS
        );
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
