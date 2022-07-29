import { Response } from "express";

export interface User {
  username: string;
  password: string;
}

export interface UserRepo {
  getUser(username: string): Promise<User | null>;
  createUser(username: string, password: string): Promise<void>;
}

export interface JWTTokenManager<Payload extends Record<string, any>> {
  create(payload: Payload): Promise<string>;
  verify(token: string): Promise<Payload>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

export enum AuthenticationErrorType {
  NoExistingUser,
  UserExists,
  ErrorGettingUser,
  ErrorCreatingUser,
  PaswordMismatch,
  NoRefreshToken,
  NoJWTToken,
  InvalidJWTToken,
  InvalidRefreshToken,
  TokenCreateError,
  ErrorWhileHashingPassword,
}

export interface ErrorHandler {
  (res: Response, errorType: AuthenticationErrorType, error?: Error): void;
}

export interface JWTTokenPayload {
  username: string;
}
