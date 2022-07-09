import { Application, createExpressApp } from "./application";

export function createApplication() {
  return new Application(createExpressApp());
}
