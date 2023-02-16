import { expect } from "./testDeps.ts";
import adaptiveRateLimiter from "./adaptiveRateLimiter.ts";

import sleep from "./utils/sleep.ts";

Deno.test("#1. It should increase the rate limit", async () => {
  for (let index = 0; index < 10; index++) {
    adaptiveRateLimiter.addResponseTime(1000);
  }

  await sleep(5500);

  expect(adaptiveRateLimiter.getRateLimit()).toBe(15);
});

Deno.test("#2. It should decrease the rate limit", async () => {
  // First we should increase the rate limit twice, so that we can see if the value is decreasing
  for (let index = 0; index < 5; index++) {
    adaptiveRateLimiter.addResponseTime(1000);
  }

  await sleep(5500);

  // First we should increase the rate limit twice, so that we can see if the value is decreasing
  for (let index = 0; index < 5; index++) {
    adaptiveRateLimiter.addResponseTime(1000);
  }

  await sleep(5500);

  const rateLimit = adaptiveRateLimiter.getRateLimit();
  expect(rateLimit).toBe(20);

  // Add long response time
  for (let index = 0; index < 10; index++) {
    adaptiveRateLimiter.addResponseTime(10000);
  }

  await sleep(5500);

  expect(adaptiveRateLimiter.getRateLimit()).toBe(15);

  // Add long response time
  for (let index = 0; index < 10; index++) {
    adaptiveRateLimiter.addResponseTime(10000);
  }

  await sleep(5500);

  expect(adaptiveRateLimiter.getRateLimit()).toBe(10);

  // Add long response time again (the value should be equal to the minimum value of rate limit)
  for (let index = 0; index < 10; index++) {
    adaptiveRateLimiter.addResponseTime(10000);
  }

  await sleep(5500);

  expect(adaptiveRateLimiter.getRateLimit()).toBe(
    +(Deno.env.get("MIN_REQUESTS")!),
  );
});
