import { Response } from "express";

export interface Constructor<T> {
  new (...args: any[]): T;
}

export interface User {
  username: string;
  password: string;
}

export interface UserRepo {
  getUser(username: string): Promise<User | null>;
  createUser(username: string, password: string): Promise<void>;
}

export interface JWTHelper {
  create<T = any>(
    secret: string,
    payload: T,
    expiresInMs: number
  ): Promise<string>;
  validate<T = any>(secret: string, token: string): Promise<T>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

export interface UserValidator {
  username: (username: string) => boolean;
  password: (password: string) => boolean;
}

export enum AuthenticationErrorType {
  InvalidRequestPayload,
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
