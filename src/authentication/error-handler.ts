import { AuthenticationErrorType, ErrorHandler } from "./models";

export const defaultErrorHandler: ErrorHandler = (res, errorType) => {
  let status: number;

  switch (errorType) {
    case AuthenticationErrorType.InvalidRequestPayload:
      status = 400;
      break;
    case AuthenticationErrorType.NoExistingUser:
      status = 500;
      break;
    case AuthenticationErrorType.UserExists:
      status = 400;
      break;
    case AuthenticationErrorType.ErrorGettingUser:
      status = 500;
      break;
    case AuthenticationErrorType.ErrorCreatingUser:
      status = 500;
      break;
    case AuthenticationErrorType.PaswordMismatch:
      status = 401;
      break;
    case AuthenticationErrorType.NoRefreshToken:
      status = 401;
      break;
    case AuthenticationErrorType.NoJWTToken:
      status = 401;
      break;
    case AuthenticationErrorType.InvalidJWTToken:
      status = 401;
      break;
    case AuthenticationErrorType.InvalidRefreshToken:
      status = 401;
      break;
    case AuthenticationErrorType.TokenCreateError:
      status = 500;
      break;
    case AuthenticationErrorType.ErrorWhileHashingPassword:
      status = 500;
      break;
    default:
      status = 400;
      break;
  }

  res.status(status).end();
};
