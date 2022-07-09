import { Request, Response } from "express";
import { JWTTokenResponder } from "./jwt-token-responder";
import {
  JWTHelper,
  JWTTokenPayload,
  PasswordHasher,
  User,
  UserRepo,
  UserValidator,
  REFRESH_TOKEN_COOKIE_NAME,
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
      public _passwordHasher: PasswordHasher
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

    public async login(req: Request, res: Response) {
      const { username, password } = req.body;
      if (
        !this._userValidator.username(username) ||
        !this._userValidator.password(password)
      ) {
        res.status(400).end();
        return;
      }

      let storedUser: User | null;
      try {
        storedUser = await this._userRepo.getUser(username);
        if (!storedUser) {
          res.status(500).end();
          return;
        }
      } catch {
        res.status(500).end();
        return;
      }
      const doesPasswordMatch = await this._passwordHasher.compare(
        password,
        storedUser.password
      );
      if (!doesPasswordMatch) {
        res.status(401).end();
        return;
      }

      this.respondWithTokens(res, username);
    }

    public async refresh(req: Request, res: Response) {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      if (!refreshToken) {
        res.status(401).end();
        return;
      }

      let username: string;
      try {
        const tokenPayload = await this._jwtHelper.validate<JWTTokenPayload>(
          this._refreshSecret,
          refreshToken
        );
        username = tokenPayload["username"];
      } catch {
        res.status(401).end();
        return;
      }

      this.respondWithTokens(res, username);
    }

    public async respondWithTokens(_: Response, __: string) {
      return;
    }
  }
);
