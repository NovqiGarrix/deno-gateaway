// deno-lint-ignore-file no-explicit-any

import { Context, Status } from "../deps.ts";
import { mapEndpoint } from "../utils/mapEndpoint.ts";
import { getEndpoint, getServiceEndpoint } from "../utils/getEndpoint.ts";
import adaptiveRateLimiter from "../rateLimiter.ts";
import logger from "../utils/logger.ts";

export default async function forwardMiddleware(
  ctx: Context<Record<string, any>, Record<string, any>>,
  next: () => Promise<unknown>,
) {
  const { request, response } = ctx;

  const serviceEndpoint = getServiceEndpoint(request.url);
  const serviceEndpointsData = mapEndpoint(serviceEndpoint);

  // Check if the service is available
  if (!serviceEndpointsData) {
    // Check if the request is for the gateaway endpoints
    if (request.url.pathname.startsWith("/gateaway")) {
      await next();
      return;
    }

    response.status = Status.ServiceUnavailable;
    response.body = {
      code: Status.ServiceUnavailable,
      error: "Service Not Found or Service is Not Available Right Now",
    };
    return;
  }

  let duration = 0;

  try {
    // The request start time
    const startTime = Date.now();

    const endpoint = getEndpoint(request.url);
    const resp = await fetch(
      `${serviceEndpointsData.base_url}${endpoint}`,
      request.originalRequest,
    );

    // The request end time
    const endTime = Date.now();
    duration = endTime - startTime;

    if (resp.headers.get("content-type") !== "application/json") {
      // Handle stream / redirect
      ctx.response
        .headers.set(
          "content-type",
          resp.headers.get("content-type") || "text/plain",
        );
      ctx.response.body = resp.body;
      return;
    }

    response.status = resp.status;
    response.headers = resp.headers;
    response.body = {
      ...await resp.json(),
      took: duration,
    };
  } catch (error) {
    logger.error(`Error forwading request: ${error.message}`);
    response.status = Status.InternalServerError;
    response.body = {
      code: Status.InternalServerError,
      error: "Internal Server Error",
    };
  } finally {
    adaptiveRateLimiter.reduceRequestCounter();
    adaptiveRateLimiter.addResponseTime(duration);
  }
}
