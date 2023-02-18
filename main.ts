import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import createServer from "./app.ts";

import logger from "./utils/logger.ts";
import redisClient from "./utils/redisClient.ts";
import serviceManager from "./utils/serviceManager.ts";

const app = createServer();
const abortController = new AbortController();

const signals = ["SIGINT", "SIGTERM"];
for (let systemSignal of signals) {
  if (Deno.build.os === "windows" && systemSignal === "SIGTERM") {
    systemSignal = "SIGBREAK";
  }

  Deno.addSignalListener(systemSignal as Deno.Signal, () => {
    logger.warning(`Received ${systemSignal}, exiting...`.toUpperCase());

    Deno.exit(0);
  });
}

// Shutdown the server when the process is about to exit
globalThis.addEventListener("unload", () => {
  const reason = "🦕 Deno is exiting!! ⬇️";

  logger.warning(reason);
  abortController.abort(reason);

  if (redisClient.isConnected) {
    serviceManager.saveToRedis();
  }
});

await app.listen({
  port: +(Deno.env.get("PORT") || 8080),
  signal: abortController.signal,
});
