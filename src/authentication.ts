import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface User {
  username: string;
  password: string;
}

export interface UserRepo {
  getUser(username: string): Promise<User>;
}

export interface LoginRequestPayload {
  username: string;
  password: string;
}

const REFRESH_TOKEN_COOKIE_NAME = "refreshtoken";

export class JWTAuthenticationController {
  constructor(
    private _jwtSecret: string,
    private _refreshSecret: string,
    private _userRepo: UserRepo
  ) {}

  async login(req: Request, res: Response) {
    const isValid = validateLoginRequestPayload(req.body);
    if (!isValid) {
      res.status(400).end();
      return;
    }
    const { username, password } = req.body;

    let storedUser: User;
    try {
      storedUser = await this._userRepo.getUser(username);
    } catch {
      res.status(500).end();
      return;
    }
    if (password !== storedUser.password) {
      res.status(401).end();
      return;
    }

    let jwtToken: string;
    try {
      jwtToken = await this._createJWTToken(username);
    } catch (err) {
      res.status(500).end();
      return;
    }

    let refreshToken: string;
    try {
      refreshToken = await this._createRefreshToken(username);
    } catch {
      res.status(500).end();
      return;
    }

    res
      .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        expires: new Date(Date.now() + 30 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        token: jwtToken,
      });
  }

  public async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      res.status(401).end();
      return;
    }

    let username: string;
    try {
      const decodedRefreshToken = await verifyJWT(
        refreshToken,
        this._refreshSecret
      );
      username = (decodedRefreshToken.payload as jwt.JwtPayload)["username"];
    } catch {
      res.status(401).end();
      return;
    }

    // TODO: share this code
    let jwtToken: string;
    try {
      jwtToken = await this._createJWTToken(username);
    } catch (err) {
      res.status(500).end();
      return;
    }

    let newRefreshToken: string;
    try {
      newRefreshToken = await this._createRefreshToken(username);
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

  private async _createJWTToken(username: string) {
    return await createJWT(
      this._jwtSecret,
      {
        username,
      },
      5 * 60 * 1000
    );
  }

  private async _createRefreshToken(username: string) {
    return createJWT(
      this._refreshSecret,
      {
        username,
      },
      30 * 60 * 1000
    );
  }
}

export function validateLoginRequestPayload(payload: LoginRequestPayload) {
  if (payload.username.trim() === "" || payload.password.trim() === "") {
    return false;
  }
  return true;
}

export function createJWT(
  secret: string,
  payload: Record<string, unknown>,
  expiresInMs: number
): Promise<string> {
  return new Promise<string>((res, rej) => {
    jwt.sign(
      payload,
      secret,
      { algorithm: "HS256", expiresIn: expiresInMs / 1000 },
      function (err, token) {
        if (err) {
          rej(err);
          return;
        }
        if (!token) {
          rej(new Error("Could not create token"));
          return;
        }
        res(token);
      }
    );
  });
}

export function verifyJWT(token: string, secret: string) {
  return new Promise<jwt.Jwt>((res, rej) => {
    jwt.verify(token, secret, { complete: true }, (err, decoded) => {
      if (err) {
        rej(err);
        return;
      }
      if (!decoded) {
        rej(new Error("Could not decode token"));
        return;
      }
      res(decoded);
    });
  });
}
