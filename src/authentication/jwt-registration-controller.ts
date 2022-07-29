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

export class JWTRegistrationController extends JWTTokenResponder {
  constructor(
    _accessJWTTokenManager: JWTTokenManager<JWTTokenPayload>,
    _refreshTokenManager: JWTTokenManager<JWTTokenPayload>,
    _errorHandler: ErrorHandler,
    private _userRepo: UserRepo,
    private _passwordHasher: PasswordHasher
  ) {
    super(_accessJWTTokenManager, _refreshTokenManager, _errorHandler);
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
}
