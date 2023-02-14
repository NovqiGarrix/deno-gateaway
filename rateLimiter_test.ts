import { Status } from "./deps.ts";
import { expect } from "./testDeps.ts";
import logger from "./utils/logger.ts";

// function sleep(time: number) {
//   return new Promise<void>((resolve) => setTimeout(resolve, time));
// }

Deno.test("$Fix Rate Limiter Testing", async () => {
  const responseStatusses: Array<number> = [];

  // 10 should be a good response, and 2 should be too many request
  const emptyArray = Array(10 + 2).fill(0);

  logger.info("STARTING REQUESTS...");
  await Promise.all(
    emptyArray.map(async () => {
      const resp = await fetch(`http://0.0.0.0:${Deno.env.get("PORT")}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      await resp.body?.cancel();

      responseStatusses.push(resp.status);
    }),
  );

  logger.info("DONE!");

  const OKResponse = responseStatusses.filter((status) => status === Status.OK);
  const tooManyRequestsResponse = responseStatusses.filter((status) =>
    status === Status.TooManyRequests
  );

  expect(OKResponse.length).toBe(10);
  expect(tooManyRequestsResponse.length).toBe(2);
});
