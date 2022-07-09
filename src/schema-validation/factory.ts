import Ajv, { Schema } from "ajv";
import { RequestBodySchemaValidatorMiddleware } from "./schema-validation";

export function createRequestBodySchemaValidator(schema: Schema) {
  const ajv = new Ajv();
  const validator = new RequestBodySchemaValidatorMiddleware(ajv, schema);
  validator.compileSchema();
  return validator;
}
