const env = Deno.env.toObject();

const defaults = {
  MIN_REQUESTS: +(env.MIN_REQUESTS || 10),

  MAX_REQUESTS: +(env.MAX_REQUESTS || 100),

  SLOW_RESPONSE_TIME: +(env.SLOW_RESPONSE_TIME || 1500),

  UPDATE_INTERVAL: +(env.UPDATE_INTERVAL || 30 * 1000),

  RATE_LIMIT: +(env.RATE_LIMIT || 20),

  REQUEST_COUNTER: 0,

  RESPONSE_TIME: 0,
};

class RateLimit {
  public static rateLimit = defaults.RATE_LIMIT;
}

export class AdaptiveRateLimiter {
  public static instance: AdaptiveRateLimiter;

  public identifier: number;

  private MIN_REQUESTS: number;

  private MAX_REQUESTS: number;

  private SLOW_RESPONSE_TIME: number;

  private UPDATE_INTERVAL: number;

  private responseTime: number;
  private requestCounter: number;

  intervals: Array<number> = [];
  cleanUpInterval: number;

  private constructor() {
    this.MIN_REQUESTS = defaults.MIN_REQUESTS;
    this.MAX_REQUESTS = defaults.MAX_REQUESTS;
    this.SLOW_RESPONSE_TIME = defaults.SLOW_RESPONSE_TIME;
    this.UPDATE_INTERVAL = defaults.UPDATE_INTERVAL;

    this.responseTime = defaults.RESPONSE_TIME;
    this.requestCounter = defaults.REQUEST_COUNTER;

    this.identifier = Math.floor(Math.random() * 1000);

    this.cleanUpInterval = setInterval(() => {
      this.requestCounter = defaults.REQUEST_COUNTER;
      this.responseTime = defaults.RESPONSE_TIME;
    }, 1000);

    // Every UPDATE_INTERVAL, update the rate limit
    this.intervals.push(setInterval(
      this.updateRateLimit,
      this.UPDATE_INTERVAL,
    ));
  }

  public static getInstance(isForTest = false): AdaptiveRateLimiter {
    if (!AdaptiveRateLimiter.instance || isForTest) {
      AdaptiveRateLimiter.instance = new AdaptiveRateLimiter();
      AdaptiveRateLimiter.getInstance().setRateLimit(defaults.RATE_LIMIT);
    }
    return AdaptiveRateLimiter.instance;
  }

  private getMultipleValue(): number {
    // 0.5 needs to calculated based on the MIN_REQUESTS and MAX_REQUESTS
    return Math.round(RateLimit.rateLimit * 0.5);
  }

  private setRateLimit(rateLimit: number): void {
    RateLimit.rateLimit = rateLimit;
  }

  private updateRateLimit(
    avgRespTime: number,
    rateLimit: number,
    multipleValue: number,
    setRateLimit: (rateLimit: number) => void,
    SLOW_RESPONSE_TIME: number,
    MIN_REQUESTS: number,
    MAX_REQUESTS: number,
  ) {
    if (isNaN(avgRespTime)) throw new Error("Average response time is NaN");

    if (avgRespTime >= SLOW_RESPONSE_TIME) {
      const nextRateLimit = rateLimit - multipleValue;
      if (nextRateLimit < 0) {
        // Set the rate limit to the minimum

        console.log({ nextRateLimit });
        setRateLimit(MIN_REQUESTS);
      } else {
        // Set the rate limit to the next value
        console.log({ nextRateLimit });
        setRateLimit(nextRateLimit);
      }
    } else {
      const nextRateLimit = rateLimit + multipleValue;
      if (nextRateLimit > MAX_REQUESTS) {
        // Set the rate limit to the maximum value

        setRateLimit(MAX_REQUESTS);
      } else {
        // Set the rate limit to the next value

        setRateLimit(nextRateLimit);
      }
    }
  }

  private reSetUpdateRateLimitInterval() {
    this.closeUpdateRateLimitInterval();

    this.intervals.push(setInterval(
      this.updateRateLimit,
      this.UPDATE_INTERVAL,
      this.getAverageResponseTime(),
      RateLimit.rateLimit,
      this.getMultipleValue(),
      this.setRateLimit,
      this.SLOW_RESPONSE_TIME,
      this.MIN_REQUESTS,
      this.MAX_REQUESTS,
    ));
  }

  private getAverageResponseTime(): number {
    return this.responseTime / this.requestCounter;
  }

  resetInstance(closeIntervals = true): void {
    if (closeIntervals) this.closeAllIntervals();

    this.responseTime = defaults.RESPONSE_TIME;
    this.requestCounter = defaults.REQUEST_COUNTER;
    this.setRateLimit(defaults.RATE_LIMIT);
  }

  getRateLimit(): number {
    return RateLimit.rateLimit;
  }

  getMinRateLimit(): number {
    return this.MIN_REQUESTS;
  }

  getMaxRateLimit(): number {
    return this.MAX_REQUESTS;
  }

  addResponseTime(responseTime: number): void {
    this.responseTime += responseTime;
    this.reSetUpdateRateLimitInterval();
  }

  getResponseTime(): number {
    return this.responseTime;
  }

  addRequestCounter(): void {
    this.requestCounter++;
  }

  reduceRequestCounter(): void {
    if (this.requestCounter < 1) return;
    this.requestCounter--;
  }

  getRequestCounter(): number {
    return this.requestCounter;
  }

  closeUpdateRateLimitInterval(): void {
    for (const i of this.intervals) {
      clearInterval(i);
    }

    this.intervals = [];
  }

  closeAllIntervals(): void {
    clearInterval(this.cleanUpInterval);

    for (const i of this.intervals) {
      clearInterval(i);
    }

    this.intervals = [];
  }
}
