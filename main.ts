import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import createServer from "./app.ts";
import serviceManager from "./utils/serviceManager.ts";

const app = createServer();
const abortController = new AbortController();

const signals = ["SIGINT", "SIGTERM"];
for (let systemSignal of signals) {
  if (Deno.build.os === "windows" && systemSignal === "SIGTERM") {
    systemSignal = "SIGBREAK";
  }

  Deno.addSignalListener(systemSignal as Deno.Signal, () => {
    console.log(`Received ${systemSignal}, exiting...`.toUpperCase());
    Deno.exit(0);
  });
}

// Shutdown the server when the process is about to exit
globalThis.addEventListener("unload", () => {
  serviceManager.saveToRedis()
    .finally(() => {
      const reason = "🦕 Deno is exiting!! ⬇️";
      console.log(reason);
      abortController.abort(reason);
    });
});

await app.listen({
  port: +(Deno.env.get("PORT") || 8080),
  signal: abortController.signal,
});
