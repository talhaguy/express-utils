import { UserValidator } from "./models";

export class DefaultUserValidator implements UserValidator {
  public username(value: string) {
    if (!value || !value.trim()) {
      return false;
    }
    return true;
  }

  public password(value: string) {
    if (!value || !value.trim()) {
      return false;
    }
    return true;
  }
}
