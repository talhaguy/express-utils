import { Request, Response } from "express";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants";
import { respondWithTokens } from "./jwt-token-responder";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
  PasswordHasher,
  User,
  UserRepo,
} from "./models";

export interface LoginRequestPayload {
  username: string;
  password: string;
}

export class JWTAuthenticationController {
  constructor(
    private _accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>,
    private _refreshTokenManager: JWTTokenManager<JWTTokenPayload>,
    private _errorHandler: ErrorHandler,
    private _userRepo: UserRepo,
    private _passwordHasher: PasswordHasher
  ) {}

  public async login(req: Request, res: Response) {
    const { username, password } = req.body;

    let storedUser: User | null;
    try {
      storedUser = await this._userRepo.getUser(username);
      if (!storedUser) {
        this._errorHandler(res, AuthenticationErrorType.NoExistingUser);
        return;
      }
    } catch (err) {
      this._errorHandler(
        res,
        AuthenticationErrorType.ErrorGettingUser,
        err as Error
      );
      return;
    }
    const doesPasswordMatch = await this._passwordHasher.compare(
      password,
      storedUser.password
    );
    if (!doesPasswordMatch) {
      this._errorHandler(res, AuthenticationErrorType.PaswordMismatch);
      return;
    }

    respondWithTokens(
      this._accessJWTTokenManager,
      this._refreshTokenManager,
      this._errorHandler,
      res,
      username
    );
  }

  public async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      this._errorHandler(res, AuthenticationErrorType.NoRefreshToken);
      return;
    }

    let username: string;
    try {
      const tokenPayload = await this._refreshTokenManager.verify(refreshToken);
      username = tokenPayload["username"];
    } catch (err) {
      this._errorHandler(
        res,
        AuthenticationErrorType.InvalidRefreshToken,
        err as Error
      );
      return;
    }

    respondWithTokens(
      this._accessJWTTokenManager,
      this._refreshTokenManager,
      this._errorHandler,
      res,
      username
    );
  }
}
