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
import { DefaultPasswordHasher } from "./password-hasher";
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
    userRepo = new InMemoryUserRepo(),
    passwordHasher = new DefaultPasswordHasher(),
    errorHandler = defaultErrorHandler,
  }: JWTControllerParams = {}
): InstanceType<typeof JWTAuthenticationController> {
  return new JWTAuthenticationController(
    accessJWTTokenManager,
    refreshJWTTokenManager,
    userRepo,
    passwordHasher,
    errorHandler
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
    userRepo = new InMemoryUserRepo(),
    passwordHasher = new DefaultPasswordHasher(),
    errorHandler = defaultErrorHandler,
  }: JWTControllerParams = {}
): InstanceType<typeof JWTRegistrationController> {
  return new JWTRegistrationController(
    accessJWTTokenManager,
    refreshJWTTokenManager,
    userRepo,
    passwordHasher,
    errorHandler
  );
}

interface JWTControllerParams {
  accessJWTTokenManager?: JWTTokenManager<JWTTokenPayload>;
  refreshJWTTokenManager?: JWTTokenManager<JWTTokenPayload>;
  userRepo?: UserRepo;
  passwordHasher?: PasswordHasher;
  errorHandler?: ErrorHandler;
}
