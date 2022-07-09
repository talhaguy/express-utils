import Ajv, { Schema } from "ajv";
import { expect } from "chai";
import { Application, createExpressApp } from "../application";
import { RequestBodySchemaValidatorMiddleware } from "./schema-validation";

describe("schema validation", () => {
  let app!: Application;

  before(async () => {
    app = new Application(createExpressApp());

    const ajv = new Ajv();
    const schema: Schema = {
      type: "object",
      properties: {
        foo: { type: "integer" },
        bar: { type: "string" },
      },
      required: ["foo"],
      additionalProperties: false,
    };
    const validator = new RequestBodySchemaValidatorMiddleware(ajv, schema);
    validator.compileSchema();

    app.expressApp.post(
      "/schema-validation",
      validator.handler.bind(validator),
      (_, res) => {
        res.json({
          message: "Passed validation",
        });
      }
    );

    await app.start(3333);
  });

  after(async () => {
    await app.stop();
  });

  it("should 400 when validation fails", async () => {
    const res = await fetch("http://localhost:3333/schema-validation", {
      method: "post",
      body: JSON.stringify({
        wrong: "prop",
      }),
    });
    expect(res.status).to.equal(400);
  });

  it("should proceed to handler when validation passes", async () => {
    const res = await fetch("http://localhost:3333/schema-validation", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        foo: 10,
        bar: "test",
      }),
    });
    const parsed = await res.json();
    expect(parsed).to.deep.equal({
      message: "Passed validation",
    });
  });
});
