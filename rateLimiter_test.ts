import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import { assertEquals, expect } from "./testDeps.ts";

import sleep from "./utils/sleep.ts";
import { AdaptiveRateLimiter } from "./rateLimiter.ts";

Deno.test("Should Reset request counter every second", async () => {
  const adaptiveRateLimiter = AdaptiveRateLimiter.getInstance(true);
  console.log(adaptiveRateLimiter.identifier);

  assertEquals(adaptiveRateLimiter.getRequestCounter(), 0);
  assertEquals(adaptiveRateLimiter.getResponseTime(), 0);

  Array(10).fill(0).forEach(() => {
    adaptiveRateLimiter.addRequestCounter();
    adaptiveRateLimiter.addResponseTime(500);
  });

  await sleep(1000);

  assertEquals(adaptiveRateLimiter.getRequestCounter(), 0);
  assertEquals(adaptiveRateLimiter.getResponseTime(), 0);

  adaptiveRateLimiter.closeAllIntervals();
});

Deno.test(
  "It should reduce the rate limit if the response time is below `SLOW_RESPONSE_TIME`",
  async () => {
    const adaptiveRateLimiter = AdaptiveRateLimiter.getInstance(true);

    const prevRateLimit = adaptiveRateLimiter.getRateLimit();

    Array(10).fill(0).forEach(() => {
      adaptiveRateLimiter.addRequestCounter();
      adaptiveRateLimiter.addResponseTime(2000);
    });

    await sleep(2000);

    const currentRateLimit = adaptiveRateLimiter.getRateLimit();

    expect(prevRateLimit).toBeGreaterThan(currentRateLimit);

    adaptiveRateLimiter.closeAllIntervals();
  },
);

Deno.test(
  "Set rate limit to above current rate limit if the response time is above the `SLOW_RESPONSE_TIME`",
  async () => {
    const adaptiveRateLimiter = AdaptiveRateLimiter.getInstance(true);

    const prevRateLimit = adaptiveRateLimiter.getRateLimit();

    Array(10).fill(0).forEach(() => {
      adaptiveRateLimiter.addRequestCounter();
      adaptiveRateLimiter.addResponseTime(500);
    });

    await sleep(2000);

    const currentRateLimit = adaptiveRateLimiter.getRateLimit();

    expect(currentRateLimit).toBeGreaterThan(prevRateLimit);

    adaptiveRateLimiter.closeAllIntervals();
  },
);
