import jwt from "jsonwebtoken";
import { JWTTokenManager } from "./models";

export class DefaultJWTManager<Payload> implements JWTTokenManager<Payload> {
  constructor(private _secret: string, private _expiresInMs: number) {}

  public async create(payload: Payload): Promise<string> {
    return new Promise<string>((res, rej) => {
      jwt.sign(
        payload as Record<string, unknown>,
        this._secret,
        { algorithm: "HS256", expiresIn: this._expiresInMs / 1000 },
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

  public async verify(token: string): Promise<Payload> {
    return new Promise<Payload>((res, rej) => {
      jwt.verify(token, this._secret, { complete: true }, (err, decoded) => {
        if (err) {
          rej(err);
          return;
        }
        if (!decoded) {
          rej(new Error("Could not decode token"));
          return;
        }
        res(decoded.payload as Payload);
      });
    });
  }
}
