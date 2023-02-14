import { AdaptiveRateLimiter } from "./rateLimiter.ts";
import sleep from "./utils/sleep.ts";

(async function () {
  const adaptiveRateLimiter = AdaptiveRateLimiter.getInstance();

  Array(10).fill(0).forEach(() => {
    adaptiveRateLimiter.addRequestCounter();
    adaptiveRateLimiter.addResponseTime(500);
  });

  console.log(adaptiveRateLimiter.intervals);

  await sleep(1000);

  adaptiveRateLimiter.closeAllIntervals();
  console.log(adaptiveRateLimiter.intervals);
})();
