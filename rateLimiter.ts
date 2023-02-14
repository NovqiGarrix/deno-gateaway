// deno-lint-ignore-file no-explicit-any
import { Context, Status } from "./deps.ts";

import redisClient from "./utils/redisClient.ts";

const config = {
  MAX_REQUESTS: 10,
  TIME_WINDOW: 60,
};

export default async function rateLimiter(
  ctx: Context<Record<string, any>, Record<string, any>>,
  next: () => Promise<unknown>,
) {
  const { request: req, response: res } = ctx;

  const key = req.ip;

  const now = Date.now() / 60; // In seconds
  const start = now - config.TIME_WINDOW; // Start where the race is starting

  const replies = await redisClient.zrevrangebyscore(key, "+inf", start);

  if (replies.length > config.MAX_REQUESTS) {
    const remainingTime = Math.round(config.TIME_WINDOW - (now - +replies[0]));

    res.status = Status.TooManyRequests;
    res.body = {
      code: Status.TooManyRequests,
      status: "Too many request",
      errors: [
        {
          error: `Too many request. Please try again in ${remainingTime}`,
          remainingTime,
        },
      ],
    };
  } else {
    await redisClient.zadd(key, now, now);
    await redisClient.expire(key, config.TIME_WINDOW);

    return next();
  }
}
