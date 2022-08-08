import {
  DEFAULT_JWT_TOKEN_EXPIRY_MS,
  DEFAULT_REFRESH_TOKEN_EXPIRY_MS,
} from "./constants";
import { defaultErrorHandler } from "./error-handler";
import { JWTAuthenticationController } from "./jwt-authentication-controller";
import { DefaultJWTManager } from "./jwt-manager";
import { JWTRegistrationController } from "./jwt-registration-controller";
import {
  ErrorHandler,
  JWTTokenManager,
  JWTTokenPayload,
  PasswordHasher,
  UserRepo,
} from "./models";
import { BcryptPasswordHasher } from "./password-hasher";
import { InMemoryUserRepo } from "./user-repo";

export function createJWTAuthenticationController(
  jwtSecret: string,
  refreshSecret: string,
  {
    accessJWTTokenManager = new DefaultJWTManager(
      jwtSecret,
      DEFAULT_JWT_TOKEN_EXPIRY_MS
    ),
    refreshJWTTokenManager = new DefaultJWTManager(
      refreshSecret,
      DEFAULT_REFRESH_TOKEN_EXPIRY_MS
    ),
    errorHandler = defaultErrorHandler,
    userRepo = new InMemoryUserRepo(),
    passwordHasher = new BcryptPasswordHasher(),
  }: JWTControllerParams = {}
): InstanceType<typeof JWTAuthenticationController> {
  return new JWTAuthenticationController(
    accessJWTTokenManager,
    refreshJWTTokenManager,
    errorHandler,
    userRepo,
    passwordHasher
  );
}

export function createJWTRegistrationController(
  jwtSecret: string,
  refreshSecret: string,
  {
    accessJWTTokenManager = new DefaultJWTManager(
      jwtSecret,
      DEFAULT_JWT_TOKEN_EXPIRY_MS
    ),
    refreshJWTTokenManager = new DefaultJWTManager(
      refreshSecret,
      DEFAULT_REFRESH_TOKEN_EXPIRY_MS
    ),
    errorHandler = defaultErrorHandler,
    userRepo = new InMemoryUserRepo(),
    passwordHasher = new BcryptPasswordHasher(),
  }: JWTControllerParams = {}
): InstanceType<typeof JWTRegistrationController> {
  return new JWTRegistrationController(
    accessJWTTokenManager,
    refreshJWTTokenManager,
    errorHandler,
    userRepo,
    passwordHasher
  );
}

export interface JWTControllerParams {
  accessJWTTokenManager?: JWTTokenManager<JWTTokenPayload>;
  refreshJWTTokenManager?: JWTTokenManager<JWTTokenPayload>;
  errorHandler?: ErrorHandler;
  userRepo?: UserRepo;
  passwordHasher?: PasswordHasher;
}
