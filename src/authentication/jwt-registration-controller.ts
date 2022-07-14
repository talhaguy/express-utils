import { Request, Response } from "express";
import { JWTTokenResponder } from "./jwt-token-responder";
import {
  AuthenticationErrorType,
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
  PasswordHasher,
  UserRepo,
} from "./models";

export interface RegisterRequestPayload {
  username: string;
  password: string;
}

export const JWTRegistrationController = JWTTokenResponder(
  class JWTRegistrationController {
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

    public async register(req: Request, res: Response) {
      const { username, password } = req.body;

      try {
        const user = await this._userRepo.getUser(username);
        if (user) {
          this._errorHandler(res, AuthenticationErrorType.UserExists);
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

      let hashedPassword: string;
      try {
        hashedPassword = await this._passwordHasher.hash(password);
      } catch (err) {
        this._errorHandler(
          res,
          AuthenticationErrorType.ErrorWhileHashingPassword,
          err as Error
        );
        return;
      }

      try {
        await this._userRepo.createUser(username, hashedPassword);
      } catch (err) {
        this._errorHandler(
          res,
          AuthenticationErrorType.ErrorCreatingUser,
          err as Error
        );
        return;
      }

      this.respondWithTokens(res, username);
    }

    public respondWithTokens(_: Response, __: string) {
      return;
    }
  }
);
