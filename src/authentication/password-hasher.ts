import bcrypt from "bcrypt";
import { PasswordHasher } from "./models";

export const DEFAULT_PASSWSORD_HASHER_SALT_ROUNDS = 10;

export class DefaultPasswordHasher implements PasswordHasher {
  public async hash(password: string) {
    return bcrypt.hash(password, DEFAULT_PASSWSORD_HASHER_SALT_ROUNDS);
  }

  public async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
