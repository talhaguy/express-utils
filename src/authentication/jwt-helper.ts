import jwt from "jsonwebtoken";
import { JWTHelper } from "./models";

export class DefaultJWTHelper implements JWTHelper {
  public async create<T>(
    secret: string,
    payload: T,
    expiresInMs: number
  ): Promise<string> {
    return new Promise<string>((res, rej) => {
      jwt.sign(
        payload as Record<string, unknown>,
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

  public async validate<T>(secret: string, token: string): Promise<T> {
    return new Promise<T>((res, rej) => {
      jwt.verify(token, secret, { complete: true }, (err, decoded) => {
        if (err) {
          rej(err);
          return;
        }
        if (!decoded) {
          rej(new Error("Could not decode token"));
          return;
        }
        res(decoded.payload as T);
      });
    });
  }
}
