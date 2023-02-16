// deno-lint-ignore-file no-explicit-any

import { Context, Status } from "../deps.ts";

import logger from "../utils/logger.ts";
import { mapEndpoint } from "../utils/mapEndpoint.ts";
import { getEndpoint, getServiceEndpoint } from "../utils/getEndpoint.ts";

export default async function forwardMiddleware(
  ctx: Context<Record<string, any>, Record<string, any>>,
  next: () => Promise<unknown>,
) {
  const { request, response } = ctx;

  const serviceEndpoint = getServiceEndpoint(request.url);
  const serviceEndpointsData = mapEndpoint(serviceEndpoint);

  // Check if the service is available
  if (!serviceEndpointsData) {
    // Check if the request is for the gateway endpoints
    if (request.url.pathname.startsWith("/gateway")) {
      return next();
    }

    response.status = Status.ServiceUnavailable;
    response.body = {
      code: Status.ServiceUnavailable,
      error: "Service Not Found or Service is Not Available Right Now",
    };
    return;
  }

  try {
    const endpoint = getEndpoint(request.url);
    const resp = await fetch(
      `${serviceEndpointsData.base_url}${endpoint}`,
      request.originalRequest,
    );

    response.body = resp.body;
  } catch (error) {
    logger.error(`Error forwading request: ${error.message}`);
    response.status = Status.InternalServerError;
    response.body = {
      code: Status.InternalServerError,
      status: "Internal Server Error",
    };
  }
}
