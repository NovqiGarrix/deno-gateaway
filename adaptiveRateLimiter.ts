import { rateLimitConfig } from "./middlewares/rateLimiter.middleware.ts";

class AdaptiveRateLimiter {
  private static instance: AdaptiveRateLimiter;

  private SECOND_IN_MILISECONDS = 1000;

  private MIN_REQUESTS = +(Deno.env.get("MIN_REQUESTS") || 10);

  private MAX_REQUESTS = +(Deno.env.get("MAX_REQUESTS") || 60);

  private UPDATE_INTERVAL = +(Deno.env.get("UPDATE_INTERVAL") || 5);

  private SLOW_RESPONSE_TIME = +(Deno.env.get("SLOW_RESPONSE_TIME") || 2);

  private responseTimes: Array<number> = [];

  private intervals: Array<number> = [];

  public static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new AdaptiveRateLimiter();
    return this.instance;
  }

  private constructor() {
    // deno-lint-ignore no-this-alias
    const that = this;

    this.intervals.push(setInterval(
      this.updateInterval,
      this.UPDATE_INTERVAL * 1000,
      that,
    ));

    this.intervals.push(setInterval(
      (there: AdaptiveRateLimiter) => {
        there.responseTimes = [];
      },
      1000,
      that,
    ));
  }

  private updateRateLimit(newRateLimit: number): void {
    rateLimitConfig.MAX_REQUESTS = newRateLimit;
  }

  private updateInterval(that: AdaptiveRateLimiter): void {
    if (!that.responseTimes.length) return;

    const averageRT = that.getAverageRT();

    let newRateLimit: number;

    if (averageRT < that.SLOW_RESPONSE_TIME) {
      newRateLimit = rateLimitConfig.MAX_REQUESTS + 5;

      if (newRateLimit > that.MAX_REQUESTS) {
        newRateLimit = that.MAX_REQUESTS;
      }
    } else {
      newRateLimit = rateLimitConfig.MAX_REQUESTS - 5;

      if (newRateLimit < that.MIN_REQUESTS) {
        newRateLimit = that.MIN_REQUESTS;
      }
    }

    that.updateRateLimit(newRateLimit);
  }

  private getAverageRT(): number {
    return this.responseTimes.reduce(
      (avg, current, _, { length }) => avg + (current / length),
      0,
    ) / this.SECOND_IN_MILISECONDS;
  }

  addResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
  }

  getRateLimit(): number {
    return rateLimitConfig.MAX_REQUESTS;
  }
}

const adaptiveRateLimiter = AdaptiveRateLimiter.getInstance();
export default adaptiveRateLimiter;
