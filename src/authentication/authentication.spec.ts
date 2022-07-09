import { expect } from "chai";
import { JWTAuthenticationController } from "./jwt-authentication-controller";
import { Application, createExpressApp } from "../express-app";
import {
  JWTHelper,
  PasswordHasher,
  UserValidator,
  UserRepo,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXPIRY_MS,
} from "./models";
import { JWTRegistrationController } from "./jwt-registration-controller";
import { DefaultJWTHelper } from "./jwt-helper";
import { DefaultPasswordHasher } from "./password-hasher";
import { stub, SinonStub } from "sinon";

describe("authentication", () => {
  let app!: Application;
  let getUserStub!: SinonStub;
  const passwordHasher: PasswordHasher = new DefaultPasswordHasher();
  const jwtHelper: JWTHelper = new DefaultJWTHelper();

  before(async () => {
    app = new Application(createExpressApp());

    getUserStub = stub();
    const userRepo: UserRepo = {
      getUser() {
        return getUserStub();
      },
      createUser() {
        return Promise.resolve();
      },
    };

    const userValidator: UserValidator = {
      username: () => true,
      password: () => true,
    };

    const jwtRegistrationCtrlr = new JWTRegistrationController(
      "jwtsecret",
      "refreshsecret",
      jwtHelper,
      userRepo,
      userValidator,
      passwordHasher
    );

    const jwtAuthCtrlr = new JWTAuthenticationController(
      "jwtsecret",
      "refreshsecret",
      jwtHelper,
      userRepo,
      userValidator,
      passwordHasher
    );

    app.expressApp.post(
      "/register",
      jwtRegistrationCtrlr.register.bind(jwtRegistrationCtrlr)
    );
    app.expressApp.post("/login", jwtAuthCtrlr.login.bind(jwtAuthCtrlr));
    app.expressApp.get("/refresh", jwtAuthCtrlr.refresh.bind(jwtAuthCtrlr));

    await app.start(3333);
  });

  beforeEach(async () => {
    const hashedPassword = await passwordHasher.hash("asdfasdf");

    getUserStub.resolves({
      username: "a@a.com",
      password: hashedPassword,
    });
  });

  after(async () => {
    await app.stop();
  });

  describe("register", () => {
    it("should fail on duplicate user registration", async () => {
      const res = await fetch("http://localhost:3333/register", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "a@a.com",
          password: "asdfasdf",
        }),
      });
      expect(res.ok).to.be.false;
    });

    it("should provide access and refresh token on successful registration", async () => {
      getUserStub.resolves(null);
      const res = await fetch("http://localhost:3333/register", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "b@b.com",
          password: "asdfasdf",
        }),
      });
      expect(res.headers.get("set-cookie")).to.contain("refreshtoken=");
      const parsed = await res.json();
      expect(parsed.token).not.to.have.lengthOf(0);
    });
  });

  describe("login", () => {
    it("should fail on invalid login", async () => {
      const res = await fetch("http://localhost:3333/login", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "a@a.com",
          password: "wrongpassword",
        }),
      });
      expect(res.ok).to.be.false;
    });

    it("should provide access and refresh token on successful login", async () => {
      const res = await fetch("http://localhost:3333/login", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "a@a.com",
          password: "asdfasdf",
        }),
      });
      expect(res.headers.get("set-cookie")).to.contain("refreshtoken=");
      const parsed = await res.json();
      expect(parsed.token).not.to.have.lengthOf(0);
    });
  });

  describe("refresh", () => {
    it("should fail when no refresh token exists", async () => {
      const res = await fetch("http://localhost:3333/refresh", {
        method: "get",
      });
      expect(res.ok).to.be.false;
    });

    it("should provide access and refresh token when a valid refresh token exists", async () => {
      const refreshToken = await jwtHelper.create(
        "refreshsecret",
        {
          username: "a@a.com",
        },
        REFRESH_TOKEN_EXPIRY_MS
      );
      const res = await fetch("http://localhost:3333/refresh", {
        method: "get",
        headers: {
          cookie: REFRESH_TOKEN_COOKIE_NAME + "=" + refreshToken,
        },
      });
      expect(res.ok).to.be.true;
      expect(res.headers.get("set-cookie")).to.contain("refreshtoken=");
      const parsed = await res.json();
      expect(parsed.token).not.to.have.lengthOf(0);
    });
  });
});
