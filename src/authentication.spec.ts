import { expect } from "chai";
import { JWTAuthenticationController, UserRepo } from "./authentication";
import { Application, createExpressApp } from "./express-app";

describe("authentication", () => {
  let app!: Application;

  before(async () => {
    app = new Application(createExpressApp());

    const userRepo: UserRepo = {
      getUser() {
        return Promise.resolve({
          username: "a@a.com",
          password: "asdfasdf",
        });
      },
    };

    const jwtAuthCtrlr = new JWTAuthenticationController(
      "jwtsecret",
      "refreshsecret",
      userRepo
    );
    app.expressApp.post("/login", jwtAuthCtrlr.login.bind(jwtAuthCtrlr));

    await app.start(3333);
  });

  after(async () => {
    await app.stop();
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
});
