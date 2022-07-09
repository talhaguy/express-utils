import { Response } from "express";
import {
  Constructor,
  JWTHelper,
  JWT_TOKEN_EXPIRY_MS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRY_MS,
} from "./models";

export function JWTTokenResponder<
  T extends Constructor<{
    jwtSecret: string;
    refreshSecret: string;
    jwtHelper: JWTHelper;
  }>
>(superClass: T) {
  return class JWTTokenResponder extends superClass {
    public async respondWithTokens(res: Response, username: string) {
      let jwtToken: string;
      try {
        jwtToken = await this.jwtHelper.create(
          this.jwtSecret,
          {
            username,
          },
          JWT_TOKEN_EXPIRY_MS
        );
      } catch (err) {
        res.status(500).end();
        return;
      }

      let newRefreshToken: string;
      try {
        newRefreshToken = await this.jwtHelper.create(
          this.refreshSecret,
          {
            username,
          },
          REFRESH_TOKEN_EXPIRY_MS
        );
      } catch {
        res.status(500).end();
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
