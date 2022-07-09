import { defaultErrorHandler } from "./error-handler";
import { JWTAuthenticationController } from "./jwt-authentication-controller";
import { DefaultJWTHelper } from "./jwt-helper";
import { JWTRegistrationController } from "./jwt-registration-controller";
import {
  ErrorHandler,
  JWTHelper,
  PasswordHasher,
  UserRepo,
  UserValidator,
} from "./models";
import { DefaultPasswordHasher } from "./password-hasher";
import { InMemoryUserRepo } from "./user-repo";
import { DefaultUserValidator } from "./user-validator";

export function createJWTAuthenticationController(
  jwtSecret: string,
  refreshSecret: string,
  {
    jwtHelper = new DefaultJWTHelper(),
    userRepo = new InMemoryUserRepo(),
    userValidator = new DefaultUserValidator(),
    passwordHasher = new DefaultPasswordHasher(),
    errorHandler = defaultErrorHandler,
  }: {
    jwtHelper?: JWTHelper;
    userRepo?: UserRepo;
    userValidator?: UserValidator;
    passwordHasher?: PasswordHasher;
    errorHandler?: ErrorHandler;
  } = {}
): InstanceType<typeof JWTAuthenticationController> {
  return new JWTAuthenticationController(
    jwtSecret,
    refreshSecret,
    jwtHelper,
    userRepo,
    userValidator,
    passwordHasher,
    errorHandler
  );
}

export function createJWTRegistrationController(
  jwtSecret: string,
  refreshSecret: string,
  {
    jwtHelper = new DefaultJWTHelper(),
    userRepo = new InMemoryUserRepo(),
    userValidator = new DefaultUserValidator(),
    passwordHasher = new DefaultPasswordHasher(),
    errorHandler = defaultErrorHandler,
  }: {
    jwtHelper?: JWTHelper;
    userRepo?: UserRepo;
    userValidator?: UserValidator;
    passwordHasher?: PasswordHasher;
    errorHandler?: ErrorHandler;
  } = {}
): InstanceType<typeof JWTRegistrationController> {
  return new JWTRegistrationController(
    jwtSecret,
    refreshSecret,
    jwtHelper,
    userRepo,
    userValidator,
    passwordHasher,
    errorHandler
  );
}
