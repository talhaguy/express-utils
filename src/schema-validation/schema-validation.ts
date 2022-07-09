import { NextFunction, Request, Response } from "express";
import Ajv, { Schema, ValidateFunction } from "ajv";

export type SchemaValidator = typeof Ajv;

export class RequestBodySchemaValidatorMiddleware {
  private _validate?: ValidateFunction;

  constructor(private _ajv: Ajv, private _schema: Schema) {}

  public compileSchema() {
    this._validate = this._ajv.compile(this._schema);
  }

  public handler(req: Request, res: Response, next: NextFunction) {
    if (!this._validate) {
      res.status(500).end();
      return;
    }

    const isValid = this._validate(req.body);
    if (!isValid) {
      res.status(400).end();
      return;
    }

    next();
  }
}

export function createRequestBodySchemaValidator(schema: Schema) {
  const ajv = new Ajv();
  const validator = new RequestBodySchemaValidatorMiddleware(ajv, schema);
  validator.compileSchema();
  return validator;
}
