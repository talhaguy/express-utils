import { expect } from "chai";
import { Application, createExpressApp } from "../application/application";
import { JWTHelper, PasswordHasher } from "./models";
import {
  REFRESH_TOKEN_COOKIE_NAME,
  DEFAULT_REFRESH_TOKEN_EXPIRY_MS,
} from "./constants";
import { DefaultJWTHelper } from "./jwt-helper";
import { DefaultPasswordHasher } from "./password-hasher";
import {
  createJWTAuthenticationController,
  createJWTRegistrationController,
} from "./factory";
import { InMemoryUserRepo } from "./user-repo";

describe("authentication", () => {
  let app!: Application;
  const passwordHasher: PasswordHasher = new DefaultPasswordHasher();
  const jwtHelper: JWTHelper = new DefaultJWTHelper();
  const userRepo = new InMemoryUserRepo();

  before(async () => {
    const hashedPassword = await passwordHasher.hash("asdfasdf");
    await userRepo.createUser("a@a.com", hashedPassword);

    app = new Application(createExpressApp());

    const jwtRegistrationCtrlr = createJWTRegistrationController(
      "jwtsecret",
      "refreshsecret",
      {
        jwtHelper,
        userRepo,
        passwordHasher,
      }
    );
    const jwtAuthCtrlr = createJWTAuthenticationController(
      "jwtsecret",
      "refreshsecret",
      {
        jwtHelper,
        userRepo,
        passwordHasher,
      }
    );

    app.expressApp.post(
      "/register",
      jwtRegistrationCtrlr.register.bind(jwtRegistrationCtrlr)
    );
    app.expressApp.post("/login", jwtAuthCtrlr.login.bind(jwtAuthCtrlr));
    app.expressApp.get("/refresh", jwtAuthCtrlr.refresh.bind(jwtAuthCtrlr));

    await app.start(3333);
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

    it("should create user and provide access and refresh token on successful registration", async () => {
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

      const user = await userRepo.getUser("b@b.com");
      expect(user!.username).to.equal("b@b.com");

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
        DEFAULT_REFRESH_TOKEN_EXPIRY_MS
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
