import { expect } from "chai";
import { Application, createExpressApp } from "../application/application";
import { checkHeader } from "./headers";

describe("headers", () => {
  let app!: Application;

  before(async () => {
    app = new Application(createExpressApp());

    const checkJsonHeader = checkHeader({
      "Content-Type": "application/json",
    });

    app.expressApp.post("/need-header", checkJsonHeader, (_, res) => {
      res.json({
        message: "Required headers are present",
      });
    });

    await app.start(3333);
  });

  after(async () => {
    await app.stop();
  });

  it("should 404 when headers not present", async () => {
    let res = await fetch("http://localhost:3333/need-header", {
      method: "post",
      headers: {},
    });
    expect(res.status).to.equal(404);

    res = await fetch("http://localhost:3333/need-header", {
      method: "post",
      headers: {
        "Content-Type": "text/html",
      },
    });
    expect(res.status).to.equal(404);
  });

  it("should proceed to handler when required headers are present", async () => {
    const res = await fetch("http://localhost:3333/need-header", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const parsed = await res.json();
    expect(parsed).to.deep.equal({
      message: "Required headers are present",
    });
  });
});
