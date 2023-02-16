import type { RouteParams, RouterContext } from "./deps.ts";
import createServer from "./app.ts";

export type { Service } from "./schemas/service.schema.ts";

export interface ZodError {
  field: string;
  error: string;
}

type ApplicationType = ReturnType<typeof createServer>;
export type ApplicationState = ApplicationType["state"];

export type OakContext<R extends string> = RouterContext<
  R,
  RouteParams<R>,
  ApplicationState
>;
