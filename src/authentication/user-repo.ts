import { User, UserRepo } from "./models";

export class InMemoryUserRepo implements UserRepo {
  private _users = new Map<string, User>();

  async getUser(username: string): Promise<User | null> {
    return this._users.get(username) ?? null;
  }

  async createUser(username: string, password: string): Promise<void> {
    if (this._users.has(username)) {
      throw new Error("User already exists");
    }
    this._users.set(username, {
      username,
      password,
    });
  }
}
