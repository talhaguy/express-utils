import { Response } from "express";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
} from "./models";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants";

export async function respondWithTokens(
  accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>,
  refreshTokenManager: JWTTokenManager<JWTTokenPayload>,
  errorHandler: ErrorHandler,
  res: Response,
  username: string
) {
  let jwtToken: string;
  try {
    jwtToken = await accessJWTTokenManager.create({
      username,
    });
  } catch (err) {
    errorHandler(res, AuthenticationErrorType.TokenCreateError, err as Error);
    return;
  }

  let newRefreshToken: string;
  try {
    newRefreshToken = await refreshTokenManager.create({
      username,
    });
  } catch (err) {
    errorHandler(res, AuthenticationErrorType.TokenCreateError, err as Error);
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
