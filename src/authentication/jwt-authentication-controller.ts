import { Request, Response } from "express";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants";
import { JWTTokenResponder } from "./jwt-token-responder";
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

export const JWTAuthenticationController = JWTTokenResponder(
  class JWTAuthenticationController {
    constructor(
      public _accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>,
      public _refreshTokenManager: JWTTokenManager<JWTTokenPayload>,
      public _userRepo: UserRepo,
      public _passwordHasher: PasswordHasher,
      public _errorHandler: ErrorHandler
    ) {}

    get accessJWTTokenManager() {
      return this._accessJWTTokenManager;
    }

    get refreshTokenManager() {
      return this._refreshTokenManager;
    }

    get errorHandler() {
      return this._errorHandler;
    }

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

      this.respondWithTokens(res, username);
    }

    public async refresh(req: Request, res: Response) {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      if (!refreshToken) {
        this._errorHandler(res, AuthenticationErrorType.NoRefreshToken);
        return;
      }

      let username: string;
      try {
        const tokenPayload = await this._refreshTokenManager.verify(
          refreshToken
        );
        username = tokenPayload["username"];
      } catch (err) {
        this._errorHandler(
          res,
          AuthenticationErrorType.InvalidRefreshToken,
          err as Error
        );
        return;
      }

      this.respondWithTokens(res, username);
    }

    public async respondWithTokens(_: Response, __: string) {
      return;
    }
  }
);
