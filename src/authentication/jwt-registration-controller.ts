import { Request, Response } from "express";
import { JWTTokenResponder } from "./jwt-token-responder";
import { JWTHelper, PasswordHasher, UserRepo, UserValidator } from "./models";

export interface RegisterRequestPayload {
  username: string;
  password: string;
}

export interface LoginRequestPayload {
  username: string;
  password: string;
}

export const JWTRegistrationController = JWTTokenResponder(
  class JWTRegistrationController {
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

    public async register(req: Request, res: Response) {
      const { username, password } = req.body;
      if (
        !this._userValidator.username(username) ||
        !this._userValidator.password(password)
      ) {
        res.status(400).end();
        return;
      }

      try {
        const user = await this._userRepo.getUser(username);
        if (user) {
          res.status(400).end();
          return;
        }

        const hashedPassword = await this._passwordHasher.hash(password);

        await this._userRepo.createUser(username, hashedPassword);
      } catch {
        res.status(500).end();
        return;
      }

      this.respondWithTokens(res, username);
    }

    public respondWithTokens(_: Response, __: string) {
      return;
    }
  }
);
