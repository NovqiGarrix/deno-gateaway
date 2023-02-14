// deno-lint-ignore-file no-explicit-any
import { Context, Status } from "../deps.ts";
import adaptiveRateLimiter from "../rateLimiter.ts";

export default function rateLimiterMiddleware(
  ctx: Context<Record<string, any>, Record<string, any>>,
  next: () => Promise<unknown>,
) {
  const { response: res } = ctx;

  const rateLimit = adaptiveRateLimiter.getRateLimit();
  const currentRequest = adaptiveRateLimiter.getRequestCounter();

  if (currentRequest >= rateLimit) {
    res.status = Status.TooManyRequests;
    res.body = {
      code: Status.TooManyRequests,
      error: "Too many requests",
    };
    return;
  }

  adaptiveRateLimiter.addRequestCounter();

  return next();
}
