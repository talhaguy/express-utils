export function bindClassMethod<T extends Record<string, unknown>>(
  controllerInstance: T,
  methodName: keyof T
) {
  const method = controllerInstance[methodName] as (
    ...args: unknown[]
  ) => unknown;
  if (!method.bind) {
    throw new Error("Cannot bind to given method name");
  }
  return (
    controllerInstance[methodName] as (...args: unknown[]) => unknown
  ).bind(controllerInstance);
}
