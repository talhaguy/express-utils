import { Request, Response } from "express";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants";
import { JWTTokenResponder } from "./jwt-token-responder";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTHelper,
  JWTTokenPayload,
  PasswordHasher,
  User,
  UserRepo,
  UserValidator,
} from "./models";

export interface RegisterRequestPayload {
  username: string;
  password: string;
}

export interface LoginRequestPayload {
  username: string;
  password: string;
}

export const JWTAuthenticationController = JWTTokenResponder(
  class JWTAuthenticationController {
    constructor(
      public _jwtSecret: string,
      public _refreshSecret: string,
      public _jwtHelper: JWTHelper,
      public _userRepo: UserRepo,
      public _userValidator: UserValidator,
      public _passwordHasher: PasswordHasher,
      public _errorHandler: ErrorHandler
    ) {}

    get jwtSecret() {
      return this._jwtSecret;
    }

    get refreshSecret() {
      return this._refreshSecret;
    }

    get jwtHelper() {
      return this._jwtHelper;
    }

    get errorHandler() {
      return this._errorHandler;
    }

    public async login(req: Request, res: Response) {
      const { username, password } = req.body;
      if (
        !this._userValidator.username(username) ||
        !this._userValidator.password(password)
      ) {
        this._errorHandler(res, AuthenticationErrorType.InvalidRequestPayload);
        return;
      }

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
        const tokenPayload = await this._jwtHelper.validate<JWTTokenPayload>(
          this._refreshSecret,
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
